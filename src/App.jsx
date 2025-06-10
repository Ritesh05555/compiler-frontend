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

  console.log('EditorScreen rendered with language:', language);
  console.log('Location:', location);

  const templates = {
    python: `print("Hello, World!")`,
    javascript: `console.log("Hello, World!");`,
    cpp: `#include <iostream>\nint main() {\n    std::cout << "Hello, World!\\n";\n    return 0;\n}`,
    c: `#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
    java: `public class Code${Date.now()} {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
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
  const [showOutput, setShowOutput] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [currentLine, setCurrentLine] = useState(1);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });

  // Calculate line numbers for display
  const lineNumbers = code.split('\n').map((_, index) => index + 1);

  // Sync line numbers and highlight with textarea scroll
  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    const highlight = highlightRef.current;

    const handleScroll = () => {
      if (textarea && lineNumbers && highlight) {
        lineNumbers.scrollTop = textarea.scrollTop; // Sync line numbers scroll
        // Adjust highlight position, accounting for padding and scroll
        const lineHeight = 24; // Matches CSS line-height
        const paddingTop = 20; // Matches textarea padding-top in CSS
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

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getCaretCoordinates = (element, position) => {
    const { value } = element;
    const lines = value.substring(0, position).split('\n');
    const currentLineText = lines[lines.length - 1];
    const lineNumber = lines.length;

    const fontSize = parseInt(getComputedStyle(element).fontSize) || 14;
    const lineHeight = parseInt(getComputedStyle(element).lineHeight) || 24;
    const charWidth = fontSize * 0.6;

    const top = (lineNumber - 1) * lineHeight - element.scrollTop + 20; // Adjust for padding-top
    const left = currentLineText.length * charWidth - element.scrollLeft + 40; // Adjust for line numbers width

    return { top, left };
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    setShowOutput(false);

    // Get cursor position and text before cursor
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newCode.substring(0, cursorPosition);
    
    // Calculate current line for tracker
    const linesBeforeCursor = textBeforeCursor.split('\n');
    setCurrentLine(linesBeforeCursor.length);

    // Calculate suggestion position
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPos = getCaretCoordinates(textarea, cursorPosition);
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
      const top = cursorPos.top + lineHeight + 10;
      const left = cursorPos.left;
      setSuggestionPosition({ top, left });
    }

    // Improved last word detection
    const lastWordMatch = textBeforeCursor.match(/[\w\.]+$/);
    const lastWord = lastWordMatch ? lastWordMatch[0].toLowerCase() : '';
    
    console.log('Last word detected:', lastWord);

    // Filter suggestions based on the last word
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

    try {
      const response = await axios.post('http://localhost:5000/api/code/execute', {
        code,
        language,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      });

      console.log('Raw API Response:', response);
      console.log('API Response Data:', response.data);

      // Check if response.data is an object
      if (typeof response.data === 'object' && response.data !== null) {
        const { output: responseOutput, error } = response.data;
        console.log('Parsed output:', responseOutput, 'Parsed error:', error);

        if (error) {
          console.log('Setting output to error:', error);
          setOutput(error);
          setIsError(true);
        } else {
          console.log('Setting output to:', responseOutput || 'No output');
          setOutput(responseOutput || 'No output');
          setIsError(false);
        }
      } else {
        // If response.data is not an object, treat it as the output
        console.log('Response.data is not an object, treating as output:', response.data);
        setOutput(response.data || 'No output');
        setIsError(false);
      }

      console.log('Setting showOutput to true');
      setShowOutput(true);

      // Log final state values
      console.log('Final state - output:', output);
      console.log('Final state - isError:', isError);
      console.log('Final state - showOutput:', showOutput);
    } catch (error) {
      console.error('Error in handleRun:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to execute code. Please check the backend server.';
      console.log('Setting output to error message:', errorMessage);
      setOutput(errorMessage);
      setIsError(true);
      setShowOutput(true);

      // Log final state values
      console.log('Final state after error - output:', output);
      console.log('Final state after error - isError:', isError);
      console.log('Final state after error - showOutput:', showOutput);
    }
  };

  const handleSave = () => {
    alert('Code saved! (Placeholder functionality)');
  };

  const handleDownload = () => {
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

  const handleShare = () => {
    const encodedCode = encodeURIComponent(code);
    const link = `${window.location.origin}/editor/${language}?code=${encodedCode}`;
    setShareLink(link);
    navigator.clipboard.writeText(link);
    alert('Shareable link copied to clipboard!');
  };

  const hideOutput = () => {
    console.log('hideOutput triggered');
    setShowOutput(false);
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
        <button onClick={handleDownload} className="action-btn">
          <i className="fa-solid fa-download"></i> Download
        </button>
        <button onClick={handleShare} className="action-btn">
          <i className="fa-solid fa-share-alt"></i> Share
        </button>
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
                  top: `${(currentLine - 1) * 24 + 20}px`, // Initial position, adjusted for padding-top
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
      {output && (
        <div className={`output-section ${isError ? 'error' : 'success'} ${showOutput ? 'show' : ''} ${mode}`}>
          <h3>Output:</h3>
          <pre>{output}</pre>
        </div>
      )}
      {shareLink && (
        <div className={`share-link ${showOutput ? 'show' : ''} ${mode}`}>
          <p>Shareable Link: <a href={shareLink} target="_blank">{shareLink}</a></p>
        </div>
      )}
    </motion.div>
  );
};

export default App;