import { useState, useEffect, Component, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <div className={`app ${mode}`}>
        <AnimatePresence>
          {showSplash ? (
            <SplashScreen key="splash" />
          ) : (
            <Routes>
              <Route path="/" element={<MainScreen />} />
              <Route
                path="/editor/:language"
                element={
                  <ErrorBoundary>
                    <EditorScreen mode={mode} toggleMode={toggleMode} />
                  </ErrorBoundary>
                }
              />
            </Routes>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
};

// Splash Screen component
const SplashScreen = () => (
  <motion.div className="splash-screen">
    <motion.h1
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 3, times: [0, 0.3, 0.7, 1] }}
    >
      Code Chintak
    </motion.h1>
  </motion.div>
);

// Main Screen component
const MainScreen = () => {
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
      <h1>Welcome to Code Chintak</h1>
      <div className="language-cards">
        {languages.map((lang) => (
          <motion.div
            key={lang.name}
            className="language-card"
            whileHover={{ scale: 1.1, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log(`Navigating to /editor/${lang.name}`);
              navigate(`/editor/${lang.name}`);
            }}
          >
            <i className={lang.icon}></i>
            <h3>{lang.label}</h3>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Editor Screen component
const EditorScreen = ({ mode, toggleMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const language = location.pathname.split('/')[2];
  const textareaRef = useRef(null);
  const suggestionRef = useRef(null);
  const editorWrapperRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const highlightRef = useRef(null);
  const modalRef = useRef(null);

  console.log('EditorScreen rendered with language:', language);
  console.log('Location:', location);

  const templates = {
    python: `# Welcome to Code Chintak! 🎉
#
# Python: The language of simplicity and power, perfect for AI, data science, and automation.
#
# Code with clarity, create with ease—Python is your gateway to endless possibilities.
#
# Happy Coding! 🚀

print("Hello Duniya")`,
    javascript: `// Welcome to Code Chintak! 🎉
// 
// JavaScript: Bring the web to life with dynamic, interactive experiences.
// 
// From front-end flair to back-end brilliance—JavaScript powers it all.
// 
// Happy Coding! 🚀
console.log("Hello, World!");`,
    cpp: `/*
 * Welcome to Code Chintak! 🎉
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
 * Welcome to Code Chintak! 🎉
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
    java: `/*
 * Welcome to Code Chintak! 🎉
 *
 * Java: The language of reliability, powering enterprises, Android apps, and more.
 *
 * Build once, run anywhere—Java is your key to scalable innovation.
 *
 * Happy Coding! 🚀
 */
public class Code${Date.now()} {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  };

  const languageKeywords = {
    python: [
      { caption: 'print', value: 'print', meta: 'keyword' },
      { caption: 'def', value: 'def', meta: 'keyword' },
      { caption: 'import', value: 'import', meta: 'keyword' },
      { caption: 'from', value: 'from', meta: 'keyword' },
      { caption: 'for', value: 'for', meta: 'keyword' },
      { caption: 'while', value: 'while', meta: 'keyword' },
      { caption: 'if', value: 'if', meta: 'keyword' },
      { caption: 'elif', value: 'elif', meta: 'keyword' },
      { caption: 'else', value: 'else', meta: 'keyword' },
      { caption: 'return', value: 'return', meta: 'keyword' },
      { caption: 'class', value: 'class', meta: 'keyword' },
      { caption: 'try', value: 'try', meta: 'keyword' },
      { caption: 'except', value: 'except', meta: 'keyword' },
      { caption: 'finally', value: 'finally', meta: 'keyword' },
      { caption: 'with', value: 'with', meta: 'keyword' },
      { caption: 'range', value: 'range', meta: 'keyword' },
      { caption: 'len', value: 'len', meta: 'keyword' },
      { caption: 'str', value: 'str', meta: 'keyword' },
      { caption: 'int', value: 'int', meta: 'keyword' },
      { caption: 'float', value: 'float', meta: 'keyword' },
      { caption: 'list', value: 'list', meta: 'keyword' },
      { caption: 'dict', value: 'dict', meta: 'keyword' },
      { caption: 'set', value: 'set', meta: 'keyword' },
      { caption: 'tuple', value: 'tuple', meta: 'keyword' },
      { caption: 'input', value: 'input', meta: 'keyword' },
      { caption: 'open', value: 'open', meta: 'keyword' },
      { caption: 'read', value: 'read', meta: 'keyword' },
      { caption: 'write', value: 'write', meta: 'keyword' },
      { caption: 'lambda', value: 'lambda', meta: 'keyword' },
      { caption: 'map', value: 'map', meta: 'keyword' },
      { caption: 'filter', value: 'filter', meta: 'keyword' },
      { caption: 'zip', value: 'zip', meta: 'keyword' },
    ],
    javascript: [
      { caption: 'console', value: 'console', meta: 'keyword' },
      { caption: 'console.log', value: 'console.log', meta: 'keyword' },
      { caption: 'let', value: 'let', meta: 'keyword' },
      { caption: 'const', value: 'const', meta: 'keyword' },
      { caption: 'var', value: 'var', meta: 'keyword' },
      { caption: 'function', value: 'function', meta: 'keyword' },
      { caption: 'return', value: 'return', meta: 'keyword' },
      { caption: 'if', value: 'if', meta: 'keyword' },
      { caption: 'else', value: 'else', meta: 'keyword' },
      { caption: 'for', value: 'for', meta: 'keyword' },
      { caption: 'while', value: 'while', meta: 'keyword' },
      { caption: 'document', value: 'document', meta: 'keyword' },
      { caption: 'window', value: 'window', meta: 'keyword' },
      { caption: 'addEventListener', value: 'addEventListener', meta: 'keyword' },
      { caption: 'Math', value: 'Math', meta: 'keyword' },
      { caption: 'Date', value: 'Date', meta: 'keyword' },
      { caption: 'JSON', value: 'JSON', meta: 'keyword' },
      { caption: 'setTimeout', value: 'setTimeout', meta: 'keyword' },
      { caption: 'setInterval', value: 'setInterval', meta: 'keyword' },
      { caption: 'fetch', value: 'fetch', meta: 'keyword' },
      { caption: 'async', value: 'async', meta: 'keyword' },
      { caption: 'await', value: 'await', meta: 'keyword' },
      { caption: 'then', value: 'then', meta: 'keyword' },
      { caption: 'catch', value: 'catch', meta: 'keyword' },
      { caption: 'Array', value: 'Array', meta: 'keyword' },
      { caption: 'Object', value: 'Object', meta: 'keyword' },
      { caption: 'String', value: 'String', meta: 'keyword' },
      { caption: 'Number', value: 'Number', meta: 'keyword' },
      { caption: 'map', value: 'map', meta: 'keyword' },
      { caption: 'filter', value: 'filter', meta: 'keyword' },
      { caption: 'reduce', value: 'reduce', meta: 'keyword' },
      { caption: 'forEach', value: 'forEach', meta: 'keyword' },
    ],
    cpp: [
      { caption: '#include', value: '#include', meta: 'keyword' },
      { caption: '<iostream>', value: '<iostream>', meta: 'keyword' },
      { caption: 'using namespace std', value: 'using namespace std', meta: 'keyword' },
      { caption: 'cout', value: 'cout', meta: 'keyword' },
      { caption: 'cin', value: 'cin', meta: 'keyword' },
      { caption: 'endl', value: 'endl', meta: 'keyword' },
      { caption: 'class', value: 'class', meta: 'keyword' },
      { caption: 'new', value: 'new', meta: 'keyword' },
      { caption: 'delete', value: 'delete', meta: 'keyword' },
      { caption: 'template', value: 'template', meta: 'keyword' },
      { caption: 'vector', value: 'vector', meta: 'keyword' },
      { caption: 'string', value: 'string', meta: 'keyword' },
      { caption: 'map', value: 'map', meta: 'keyword' },
      { caption: 'unordered_map', value: 'unordered_map', meta: 'keyword' },
      { caption: 'auto', value: 'auto', meta: 'keyword' },
      { caption: 'nullptr', value: 'nullptr', meta: 'keyword' },
      { caption: 'int', value: 'int', meta: 'keyword' },
      { caption: 'double', value: 'double', meta: 'keyword' },
      { caption: 'float', value: 'float', meta: 'keyword' },
      { caption: 'if', value: 'if', meta: 'keyword' },
      { caption: 'else', value: 'else', meta: 'keyword' },
      { caption: 'switch', value: 'switch', meta: 'keyword' },
      { caption: 'case', value: 'case', meta: 'keyword' },
      { caption: 'for', value: 'for', meta: 'keyword' },
      { caption: 'while', value: 'while', meta: 'keyword' },
      { caption: 'do', value: 'do', meta: 'keyword' },
      { caption: 'return', value: 'return', meta: 'keyword' },
      { caption: 'char', value: 'char', meta: 'keyword' },
      { caption: 'void', value: 'void', meta: 'keyword' },
      { caption: 'malloc', value: 'malloc', meta: 'keyword' },
      { caption: 'free', value: 'free', meta: 'keyword' },
      { caption: 'struct', value: 'struct', meta: 'keyword' },
    ],
    c: [
      { caption: '#include', value: '#include', meta: 'keyword' },
      { caption: '<stdio.h>', value: '<stdio.h>', meta: 'keyword' },
      { caption: 'int', value: 'int', meta: 'keyword' },
      { caption: 'main', value: 'main', meta: 'keyword' },
      { caption: 'printf', value: 'printf', meta: 'keyword' },
      { caption: 'scanf', value: 'scanf', meta: 'keyword' },
      { caption: 'return', value: 'return', meta: 'keyword' },
      { caption: 'for', value: 'for', meta: 'keyword' },
      { caption: 'while', value: 'while', meta: 'keyword' },
      { caption: 'do', value: 'do', meta: 'keyword' },
      { caption: 'if', value: 'if', meta: 'keyword' },
      { caption: 'else', value: 'else', meta: 'keyword' },
      { caption: 'switch', value: 'switch', meta: 'keyword' },
      { caption: 'case', value: 'case', meta: 'keyword' },
      { caption: 'char', value: 'char', meta: 'keyword' },
      { caption: 'float', value: 'float', meta: 'keyword' },
      { caption: 'double', value: 'double', meta: 'keyword' },
      { caption: 'void', value: 'void', meta: 'keyword' },
      { caption: 'malloc', value: 'malloc', meta: 'keyword' },
      { caption: 'free', value: 'free', meta: 'keyword' },
      { caption: 'struct', value: 'struct', meta: 'keyword' },
    ],
    java: [
      { caption: 'public', value: 'public', meta: 'keyword' },
      { caption: 'class', value: 'class', meta: 'keyword' },
      { caption: 'static', value: 'static', meta: 'keyword' },
      { caption: 'void', value: 'void', meta: 'keyword' },
      { caption: 'main', value: 'main', meta: 'keyword' },
      { caption: 'System', value: 'System', meta: 'keyword' },
      { caption: 'System.out', value: 'System.out', meta: 'keyword' },
      { caption: 'System.out.println', value: 'System.out.println', meta: 'keyword' },
      { caption: 'int', value: 'int', meta: 'keyword' },
      { caption: 'double', value: 'double', meta: 'keyword' },
      { caption: 'String', value: 'String', meta: 'keyword' },
      { caption: 'boolean', value: 'boolean', meta: 'keyword' },
      { caption: 'for', value: 'for', meta: 'keyword' },
      { caption: 'while', value: 'while', meta: 'keyword' },
      { caption: 'if', value: 'if', meta: 'keyword' },
      { caption: 'else', value: 'else', meta: 'keyword' },
      { caption: 'import', value: 'import', meta: 'keyword' },
      { caption: 'new', value: 'new', meta: 'keyword' },
      { caption: 'return', value: 'return', meta: 'keyword' },
      { caption: 'try', value: 'try', meta: 'keyword' },
      { caption: 'catch', value: 'catch', meta: 'keyword' },
      { caption: 'finally', value: 'finally', meta: 'keyword' },
      { caption: 'Scanner', value: 'Scanner', meta: 'keyword' },
      { caption: 'ArrayList', value: 'ArrayList', meta: 'keyword' },
      { caption: 'HashMap', value: 'HashMap', meta: 'keyword' },
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

  // Sync line numbers and highlight with textarea scroll
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

  // Handle clicks outside to close suggestions and modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        showImageModal
      ) {
        setShowImageModal(false);
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
    
    console.log('Last word detected:', lastWord);

    const keywords = languageKeywords[language] || [];
    const filteredSuggestions = keywords
      .filter((item) => item.value.toLowerCase().startsWith(lastWord))
      .slice(0, 5);
    
    console.log('Filtered suggestions:', filteredSuggestions);
    if (lastWord) {
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      setSuggestions([]);
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

    const newCode =
      code.substring(0, lastWordStart) +
      suggestion.value +
      textAfterCursor;

    setCode(newCode);
    setSuggestions([]);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = lastWordStart + suggestion.value.length;
      textarea.selectionEnd = lastWordStart + suggestion.value.length;
    }, 0);
  };

  const handleRun = async () => {
    console.log('handleRun triggered');
    console.log('Request payload:', { code, language });

    setShowOutput(true);
    setShowShareLink(false);
    setIsLoading(true);
    setOutput('');
    setImageUrl('');
    setHasOutput(true);

    try {
      const response = await axios.post('http://localhost:5000/api/code/execute', {
        code,
        language,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('Raw API Response:', response);
      console.log('API Response Data:', response.data);

      if (typeof response.data === 'object' && response.data !== null) {
        const { output: responseOutput, error, imageUrl: responseImageUrl } = response.data;
        console.log('Parsed output:', responseOutput, 'Parsed error:', error, 'Image URL:', responseImageUrl);

        if (error) {
          console.log('Setting output to error:', error);
          setOutput(error);
          setIsError(true);
        } else {
          console.log('Setting output to:', responseOutput || 'No output');
          setOutput(responseOutput || 'No output');
          setIsError(false);
        }
        setImageUrl(responseImageUrl ? `http://localhost:5000${responseImageUrl}` : '');
      } else {
        console.log('Response.data is not an object, treating as output:', response.data);
        setOutput(response.data || 'No output');
        setIsError(false);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error in handleRun:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to execute code. Please check the backend server.';
      console.log('Setting output to error message:', errorMessage);
      setOutput(errorMessage);
      setIsError(true);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const response = await axios.post('http://localhost:5000/api/code/save', {
        code,
        language,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('Save API Response:', response.data);
      const { linkId } = response.data;
      setLinkId(linkId);
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error) {
      console.error('Error in handleSave:', error);
      alert('Failed to save code. Please try again.');
      setIsSaving(false);
      setIsSaved(false);
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
      const fileName = imageUrl.split('/').pop();
      saveAs(imageUrl, fileName);
    }
  };

  const handleShare = () => {
    if (!linkId) {
      alert('Please save your code before sharing!');
      return;
    }

    setIsGeneratingLink(true);
    setTimeout(() => {
      const websiteName = "Code Chintak";
      const formattedLink = `${websiteName}/${linkId}`;
      setShareLink(formattedLink);
      setIsGeneratingLink(false);
      setShowShareLink(true);
    }, 1000);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(`http://localhost:5000/api/code/${linkId}`);
    alert('Link copied to clipboard!');
    setTimeout(() => {
      setShowShareLink(false);
    }, 500);
  };

  const hideOutput = () => {
    console.log('hideOutput triggered');
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sharedCode = params.get('code');
    if (sharedCode) {
      setCode(decodeURIComponent(sharedCode));
    }
  }, [location]);

  if (!language || !templates[language]) {
    console.error('Invalid or missing language:', language);
    return (
      <div className="editor-screen">
        <h2>Error: Invalid language selected</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  return (
    <motion.div
      className="editor-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="navbar">
        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Code Chintak</h1>
      </nav>
      <div className={`action-bar ${mode}`}>
        <button onClick={handleRun} className="action-btn">
          <i className="fa-solid fa-play"></i> Run
        </button>
        <button onClick={toggleMode} className="mode-toggle">
          <i className={mode === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'}></i>
          {mode === 'light' ? 'Dark' : 'Light'}
        </button>
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
                <i
                  className="fa-solid fa-copy copy-icon"
                  onClick={handleCopyToClipboard}
                  style={{ cursor: 'pointer', marginLeft: '10px' }}
                ></i>
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
                <div
                  key={number}
                  className={`line-number ${number === currentLine ? 'current-line' : ''}`}
                >
                  {number}
                </div>
              ))}
            </div>
            <div className="code-editor-wrapper">
              <div
                className="current-line-highlight"
                ref={highlightRef}
                style={{
                  top: `${(currentLine - 1) * 24 + 20}px`,
                  height: '24px',
                }}
              />
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
              style={{
                top: suggestionPosition.top,
                left: suggestionPosition.left,
              }}
              ref={suggestionRef}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="recommendation-item"
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
        <motion.div
          className={`notification ${mode}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Code is saving...
        </motion.div>
      )}
      {isSaved && (
        <motion.div
          className={`notification ${mode}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Code saved!
        </motion.div>
      )}
      {isGeneratingLink && (
        <motion.div
          className={`notification ${mode}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
                  <img
                    src={imageUrl}
                    alt="Output Image"
                    onClick={openImageModal}
                    style={{ cursor: 'pointer' }}
                  />
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