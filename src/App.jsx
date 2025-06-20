import { useState, useEffect, Component, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Error Boundary to catch rendering errors in EditorScreen
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Something went wrong in EditorScreen:</h2>
          <pre>{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.href = '/'}>Go Back to Home</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main App component
const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState('dark'); // Default to dark mode

  useEffect(() => {
    console.log('App: Rendering, showSplash=', showSplash);
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className={`app ${mode}`}>
        <AnimatePresence>
          {showSplash ? (
            <SplashScreen key="splash" />
          ) : (
            <Routes>
              <Route path="/" element={<MainScreen mode={mode} />} />
              <Route
                path="/editor/:language"
                element={
                  <ErrorBoundary>
                    <EditorScreen mode={mode} setMode={setMode} />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/code/:language/:codeId"
                element={
                  <ErrorBoundary>
                    <EditorScreen mode={mode} setMode={setMode} isShared />
                  </ErrorBoundary>
                }
              />
              <Route path="*" element={<div><h2>404: Page Not Found</h2><button onClick={() => window.location.href = '/'}>Go Home</button></div>} />
            </Routes>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
};

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src="/logo3.png" alt="Logo" className="splash-logo" />
        <h1 className="fade-text">KODE SMITH</h1>
      </div>
    </div>
  );
};

const MainScreen = ({ mode }) => {
  console.log('MainScreen: Rendering');
  const navigate = useNavigate();
  const languages = [
    { name: 'python', label: 'Python', icon: 'fa-brands fa-python' },
    { name: 'javascript', label: 'JavaScript', icon: 'fa-brands fa-js' },
    { name: 'cpp', label: 'C++', icon: 'fa-solid fa-code' },
    { name: 'c', label: 'C', icon: 'fa-solid fa-code' },
    { name: 'java', label: 'Java', icon: 'fa-brands fa-java' },
  ];

  return (
    <motion.div
      className="main-screen"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 style={{ background: 'linear-gradient(to right, #7EF29D, #7DE7F8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>Compiler is ready ⚙️ choose your command language!</h1>
      <div className="language-cards">
        {languages.map((lang) => (
          <motion.div
            key={lang.name}
            className="language-card"
            whileHover={{ scale: 1.1, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/editor/${lang.name}`)}
          >
            <i className={lang.icon}></i>
            <h3>{lang.label}</h3>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const EditorScreen = ({ mode, setMode, isShared }) => {
  console.log('EditorScreen: Rendering, isShared=', isShared);
  const navigate = useNavigate();
  const { language, codeId } = useParams();
  const textareaRef = useRef(null);
  const suggestionRef = useRef(null);
  const editorWrapperRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const highlightRef = useRef(null);
  const modalRef = useRef(null);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [fetchError, setFetchError] = useState(null);

  const templates = {
    python: `# Welcome to Kode Smith! 🎉
#
# Python: The language of simplicity and power, perfect for AI, data science, and automation.
#
# Code with clarity, create with ease—Python is your gateway to endless possibilities.
#
# Happy Coding! 🚀

print("Hello Duniya")`,

    javascript: `// Welcome to Kode Smith! 🎉
// 
// JavaScript: Bring the web to life with dynamic, interactive experiences.
// 
// From front-end flair to back-end brilliance—JavaScript powers it all.
// 
// Happy Coding! 🚀
console.log("Hello, World!");`,

    cpp: `/*
 * Welcome to Kode Smith! 🎉
 *
 * C++: The language of speed and control, ideal for games, systems, and performance-driven apps.
 *
 * Harness the power of C++—where precision meets performance.
 *
 * Happy Coding! 🚀
 */
#include <iostream>
int main() {
    std::cout << "Hello, World!\\n";
    return 0;
}`,

    c: `/*
 * Welcome to Kode Smith! 🎉
 *
 * C: The foundation of modern programming, built for speed and low-level control.
 *
 * Code close to the metal—unleash the raw power of C.
 *
 * Happy Coding! 🚀
 */
#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}`,

    java: `
public class KodeSmith {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
  };

  const languageKeywords = {
    python: [
      { caption: 'print', value: 'print', meta: 'keyword' },
      { caption: 'def', value: 'def', meta: 'keyword' },
      { caption: 'import', value: 'import', meta: 'keyword' },
    ],
    javascript: [
      { caption: 'console', value: 'console', meta: 'keyword' },
      { caption: 'console.log', value: 'console.log', meta: 'keyword' },
      { caption: 'let', value: 'let', meta: 'keyword' },
    ],
    cpp: [
      { caption: '#include', value: '#include', meta: 'keyword' },
      { caption: '<iostream>', value: '<iostream>', meta: 'keyword' },
      { caption: 'using namespace std', value: 'using namespace std', meta: 'keyword' },
    ],
    c: [
      { caption: '#include', value: '#include', meta: 'keyword' },
      { caption: '<stdio.h>', value: '<stdio.h>', meta: 'keyword' },
      { caption: 'int', value: 'int', meta: 'keyword' },
    ],
    java: [
      { caption: 'public', value: 'public', meta: 'keyword' },
      { caption: 'class', value: 'class', meta: 'keyword' },
      { caption: 'static', value: 'static', meta: 'keyword' },
    ],
  };

  const [code, setCode] = useState(templates[language] || '');
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [linkId, setLinkId] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [currentLine, setCurrentLine] = useState(1);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [imageUrl, setImageUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  const lineNumbers = code.split('\n').map((_, index) => index + 1);

  const themes = [
    { name: 'Light Mode', value: 'light' },
    { name: 'Dark Mode', value: 'dark' },
    { name: 'Dracula Mode', value: 'dracula' },
    { name: 'Tokyo Night Mode', value: 'tokyo-night' },
    { name: 'Nord Mode', value: 'nord' },
    { name: 'Custom Neon Mode', value: 'custom-neon' },
  ];

  useEffect(() => {
    if (isShared && codeId) {
      console.log('EditorScreen: Fetching shared code for codeId=', codeId);
      setIsLoading(true);
      axios
        .get(`https://compiler-backend-gxeb.onrender.com/api/code/${codeId}`) // Update to deployed backend URL
        .then((response) => {
          console.log('EditorScreen: Shared code fetched', response.data);
          const { code: sharedCode, language: sharedLanguage } = response.data;
          if (sharedLanguage === language) {
            setCode(sharedCode);
            setLinkId(codeId);
            setShareLink(`https://compiler-frontend-gxeb.onrender.com/${sharedLanguage}/${codeId}`);
          } else {
            setCode(templates[language] || '');
            setFetchError('Language mismatch in shared code.');
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('EditorScreen: Failed to load shared code:', error);
          setCode(templates[language] || '');
          setFetchError('Failed to load shared code.');
          setIsLoading(false);
        });
    }
  }, [isShared, codeId, language]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    const highlight = highlightRef.current;

    const handleScroll = () => {
      if (textarea && lineNumbers && highlight) {
        lineNumbers.scrollTop = textarea.scrollTop;
        const lineHeight = 24;
        const paddingTop = 20;
        highlight.style.top = `${(currentLine - 1) * lineHeight + paddingTop - textarea.scrollTop}px`;
      }
    };

    if (textarea) {
      textarea.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('scroll', handleScroll);
      }
    };
  }, [currentLine]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
      if (modalRef.current && !modalRef.current.contains(event.target) && showImageModal) {
        setShowImageModal(false);
      }
      if (!event.target.closest('.mode-toggle') && !event.target.closest('.mode-dropdown')) {
        setShowModeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showImageModal]);

  const getCaretCoordinates = (element, position) => {
    const { value } = element;
    const lines = value.substring(0, position).split('\n');
    const currentLineText = lines[lines.length - 1];
    const lineNumber = lines.length;

    const fontSize = parseInt(getComputedStyle(element).fontSize) || 14;
    const lineHeight = parseInt(getComputedStyle(element).lineHeight) || 24;
    const charWidth = fontSize * 0.6;

    const top = (lineNumber - 1) * lineHeight - element.scrollTop + 20;
    const left = currentLineText.length * charWidth - element.scrollLeft + 40;

    return { top, left };
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    setShowOutput(false);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newCode.substring(0, cursorPosition);

    const linesBeforeCursor = textBeforeCursor.split('\n');
    setCurrentLine(linesBeforeCursor.length);

    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPos = getCaretCoordinates(textarea, cursorPosition);
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
      const top = cursorPos.top + lineHeight + 10;
      const left = cursorPos.left;
      setSuggestionPosition({ top, left });
    }

    const lastWordMatch = textBeforeCursor.match(/[\w\.]+$/);
    const lastWord = lastWordMatch ? lastWordMatch[0].toLowerCase() : '';

    const keywords = languageKeywords[language] || [];
    const filteredSuggestions = keywords
      .filter((item) => item.value.toLowerCase().startsWith(lastWord))
      .slice(0, 5);

    if (lastWord) {
      setSuggestions(filteredSuggestions);
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }

    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > -1 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        insertSuggestion(suggestions[selectedSuggestionIndex]);
      } else if (e.key === ' ' || e.key === 'Enter') {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    }
  };

  const insertSuggestion = (suggestion) => {
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = code.substring(0, cursorPosition);

    const lastWordMatch = textBeforeCursor.match(/[\w\.]+$/);
    const lastWord = lastWordMatch ? lastWordMatch[0] : '';
    const lastWordStart = lastWord ? textBeforeCursor.lastIndexOf(lastWord) : cursorPosition;
    const textAfterCursor = code.substring(cursorPosition);

    const newCode = code.substring(0, lastWordStart) + suggestion.value + textAfterCursor;

    setCode(newCode);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = lastWordStart + suggestion.value.length;
      textarea.selectionEnd = lastWordStart + suggestion.value.length;
    }, 0);
  };

  const handleRun = async () => {
    setShowOutput(true);
    setShowShareLink(false);
    setIsLoading(true);
    setOutput('');
    setImageUrl('');
    setHasOutput(true);

    try {
      const response = await axios.post('https://compiler-backend-e3eg.onrender.com/api/code/execute', {
        code,
        language,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 25000,
      });

      if (typeof response.data === 'object' && response.data !== null) {
        const { output: responseOutput, error, imageUrl: responseImageUrl } = response.data;
        if (error) {
          setOutput(error);
          setIsError(true);
        } else {
          setOutput(responseOutput || 'No output');
          setIsError(false);
        }
        setImageUrl(responseImageUrl ? `https://compiler-backend-e3eg.onrender.com${responseImageUrl}` : '');
      } else {
        setOutput(response.data || 'No output');
        setIsError(false);
      }

      setIsLoading(false);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to execute code. Please check the backend server.';
      setOutput(errorMessage);
      setIsError(true);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);

    try {
      const response = await axios.post(
        'https://compiler-backend-e3eg.onrender.com/api/code/save',
        {
          code,
          language,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      const { linkId } = response.data;
      setLinkId(linkId);
      setShareLink(response.data.link); // Use the link directly from backend response
      setIsSaved(true);
      console.log('Save successful, linkId:', linkId, 'shareLink:', response.data.link);

      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      alert('Failed to save code. Please try again.');
      setIsSaving(false);
      setIsSaved(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCode = () => {
    const fileExtension = {
      python: 'py',
      javascript: 'js',
      cpp: 'cpp',
      c: 'c',
      java: 'java',
    }[language];

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `code.${fileExtension}`);
  };

  const handleDownloadImage = () => {
    if (imageUrl) {
      saveAs(imageUrl, imageUrl.split('/').pop());
    }
  };

  const handleShare = () => {
    console.log('handleShare called, isSaved:', isSaved, 'linkId:', linkId, 'shareLink:', shareLink);
    if (!shareLink) {
      alert('Please save your code before sharing!');
      return;
    }
    setShowShareLink(true);
  };

  const handleCopyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert('Link copied to clipboard!');
      setTimeout(() => setShowShareLink(false), 500);
    }
  };

  const hideOutput = () => {
    setShowOutput(false);
    setIsLoading(false);
    setImageUrl('');
  };

  const openImageModal = () => {
    if (imageUrl) {
      setShowImageModal(true);
    }
  };

  const toggleOutput = () => {
    setShowOutput(!showOutput);
  };

  const toggleModeDropdown = () => {
    setShowModeDropdown(!showModeDropdown);
  };

  const handleModeSelect = (modeValue) => {
    setMode(modeValue);
    setShowModeDropdown(false);
  };

  if (!language || !templates[language]) {
    return (
      <div className="editor-screen">
        <h2>Error: Invalid language selected</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  if (isLoading && isShared) {
    return (
      <div className="editor-screen">
        <h2>Loading shared code...</h2>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="editor-screen">
        <h2>Error: {fetchError}</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  return (
    <motion.div className="editor-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <nav className="navbar">
        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>KODE SMITH</h1>
      </nav>
      <div className={`action-bar ${mode}`}>
        <button onClick={handleRun} className="action-btn">
          <i className="fa-solid fa-play"></i> Run (Ctrl+Enter)
        </button>
        <div className="mode-toggle-container">
          <button onClick={toggleModeDropdown} className="mode-toggle">
            <i className="fa-solid fa-palette"></i> Theme
          </button>
          {showModeDropdown && (
            <motion.div
              className={`mode-dropdown ${mode}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {themes.map((theme) => (
                <div key={theme.value} className="mode-dropdown-item" onClick={() => handleModeSelect(theme.value)}>
                  {theme.name}
                </div>
              ))}
            </motion.div>
          )}
        </div>
        <button onClick={handleSave} className="action-btn">
          <i className="fa-solid fa-save"></i> Save
        </button>
        <button onClick={handleDownloadCode} className="action-btn">
          <i className="fa-solid fa-download"></i> Download
        </button>
        <div className="share-container">
          <button onClick={handleShare} className="action-btn">
            <i className="fa-solid fa-share-alt"></i> Share
          </button>
          {showShareLink && (
            <motion.div
              className={`share-link ${mode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: showShareLink ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <p>
                <span>{shareLink}</span>
                <i className="fa-solid fa-copy copy-icon" onClick={handleCopyToClipboard} style={{ cursor: 'pointer', marginLeft: '10px' }}></i>
              </p>
            </motion.div>
          )}
        </div>
      </div>
      <div className="editor-container">
        <div className={`editor-section ${mode}`}>
          <div className="editor-wrapper" ref={editorWrapperRef}>
            <div className={`line-numbers ${mode}`} ref={lineNumbersRef}>
              {lineNumbers.map((number) => (
                <div key={number} className={`line-number ${number === currentLine ? 'current-line' : ''}`}>
                  {number}
                </div>
              ))}
            </div>
            <div className="code-editor-wrapper">
              <div className="current-line-highlight" ref={highlightRef} style={{ top: `${(currentLine - 1) * 24 + 20}px`, height: '24px' }} />
              <textarea
                id="code-editor"
                className={`code-editor ${mode}`}
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                onClick={hideOutput}
                spellCheck="false"
              />
            </div>
          </div>
          {suggestions.length > 0 && (
            <div
              className={`recommendation-container ${mode}`}
              style={{ top: suggestionPosition.top, left: suggestionPosition.left }}
              ref={suggestionRef}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`recommendation-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                  onClick={() => insertSuggestion(suggestion)}
                >
                  <span className="recommendation-value">{suggestion.value}</span>
                  <span className="recommendation-meta">{suggestion.meta}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isSaving && (
        <motion.div className={`notification ${mode}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          Code is saving...
        </motion.div>
      )}
      {isSaved && (
        <motion.div className={`notification ${mode}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          Code saved!
        </motion.div>
      )}
      {isGeneratingLink && (
        <motion.div className={`notification ${mode}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          Generating link...
        </motion.div>
      )}
      {showOutput && (
        <motion.div
          className={`output-section ${isError ? 'error' : 'success'} ${showOutput ? 'show' : ''} ${mode}`}
          initial={{ transform: 'translateY(100%)' }}
          animate={{ transform: showOutput ? 'translateY(0)' : 'translateY(100%)' }}
          transition={{ duration: 0.3 }}
        >
          <h3>Output:</h3>
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <div className="output-content">
              <pre>{output}</pre>
              {imageUrl && (
                <div className="output-image">
                  <img src={imageUrl} alt="Output Image" onClick={openImageModal} style={{ cursor: 'pointer' }} />
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
      {hasOutput && (
        <motion.button
          className={`toggle-output-btn ${mode}`}
          onClick={toggleOutput}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <i className={`fa-solid ${showOutput ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
        </motion.button>
      )}
      {showImageModal && (
        <motion.div
          className="image-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`image-modal-content ${mode}`} ref={modalRef}>
            <img src={imageUrl} alt="Full Screen Output Image" />
            <div className="image-modal-actions">
              <button onClick={handleDownloadImage} className="action-btn">
                <i className="fa-solid fa-download"></i> Download Image
              </button>
              <button onClick={() => setShowImageModal(false)} className="action-btn">
                <i className="fa-solid fa-times"></i> Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default App;