// import { useState, useEffect, Component, useRef } from 'react';
// import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { saveAs } from 'file-saver';
// import { motion, AnimatePresence } from 'framer-motion';
// import './App.css';

// // Move templates outside the component to avoid initialization issues
// const templates = {
//   python: `# Welcome to Kode Smith! 🎉\n#\n# Python: The language of simplicity and power, perfect for AI, data science, and automation.\n#\n# Code with clarity, create with ease—Python is your gateway to endless possibilities.\n#\n\nprint("Hello Duniya")`,
//   javascript: `// Welcome to Kode Smith! 🎉\n// \n// JavaScript: Bring the web to life with dynamic, interactive experiences.\n// \n// From front-end flair to back-end brilliance—JavaScript powers it all.\n// \n\nconsole.log("Hello, World!");`,
//   cpp: `/*\n * Welcome to Kode Smith! 🎉\n *\n * C++: The language of speed and control, ideal for games, systems, and performance-driven apps.\n *\n * Harness the power of C++—where precision meets performance.\n *\n * Happy Coding! 🚀\n */\n#include <iostream>\nint main() {\n    std::cout << "Hello, World!\\n";\n    return 0;\n}`,
//   c: `/*\n * Welcome to Kode Smith! 🎉\n *\n * C: The foundation of modern programming, built for speed and low-level control.\n *\n * Code close to the metal—unleash the raw power of C.\n *\n * Happy Coding! 🚀\n */\n#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");
//     return 0;\n}`,
//   java: `\npublic class KodeSmith {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`
// };

// // Error Boundary to catch rendering errors in EditorScreen
// class ErrorBoundary extends Component {
//   state = { hasError: false, error: null };

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error("ErrorBoundary caught an error:", error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="error-boundary">
//           <h2>Something went wrong in EditorScreen:</h2>
//           <pre>{this.state.error?.toString()}</pre>
//           <button onClick={() => window.location.href = '/'}>Go Back to Home</button>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// // Loading Screen Component for shared links
// const LoadingScreen = () => {
//   return (
//     <div className="loading-screen">
//       <div className="loading-content">
//         <h1>Loading Code</h1>
//       </div>
//     </div>
//   );
// };

// // SplashScreen Component
// const SplashScreen = () => {
//   return (
//     <div className="splash-screen">
//       <div className="splash-content">
//         <img src="/logo3.png" alt="Kode Smith Logo" className="splash-logo" />
//         <h1 className="fade-text">KODE SMITH</h1>
//       </div>
//     </div>
//   );
// };

// // MainScreen Component
// const MainScreen = ({ mode }) => {
//   const navigate = useNavigate();
//   const languages = [
//     { name: 'python', label: 'Python', icon: 'fa-brands fa-python' },
//     { name: 'javascript', label: 'JavaScript', icon: 'fa-brands fa-js' },
//     { name: 'cpp', label: 'C++', icon: 'fa-solid fa-code' },
//     { name: 'c', label: 'C', icon: 'fa-solid fa-code' },
//     { name: 'java', label: 'Java', icon: 'fa-brands fa-java' },
//   ];

//   return (
//     <motion.div
//       className="main-screen"
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8 }}
//     >
//       <h1>Compiler is ready ⚙️ choose your command language!</h1>
//       <div className="language-cards">
//         {languages.map((lang) => (
//           <motion.div
//             key={lang.name}
//             className="language-card"
//             whileHover={{ scale: 1.1, rotate: 2 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => navigate(`/editor/${lang.name}`)}
//           >
//             <i className={lang.icon}></i>
//             <h3>{lang.label}</h3>
//           </motion.div>
//         ))}
//       </div>
//     </motion.div>
//   );
// };

// // EditorScreen Component
// const EditorScreen = ({ mode, setMode }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { language: paramLanguage } = useParams();
//   const textareaRef = useRef(null);
//   const suggestionRef = useRef(null);
//   const editorWrapperRef = useRef(null);
//   const lineNumbersRef = useRef(null);
//   const highlightRef = useRef(null);
//   const modalRef = useRef(null);
  
//   const searchParams = new URLSearchParams(location.search);
//   const token = searchParams.get('token');

//   const [code, setCode] = useState('');
//   const [currentLanguage, setCurrentLanguage] = useState(paramLanguage);
//   const [output, setOutput] = useState('');
//   const [isError, setIsError] = useState(false);
//   const [shareLink, setShareLink] = useState('');
//   const [linkId, setLinkId] = useState('');
//   const [showOutput, setShowOutput] = useState(false);
//   const [hasOutput, setHasOutput] = useState(false);
//   const [showShareLink, setShowShareLink] = useState(false);
//   const [isLoadingInitialCode, setIsLoadingInitialCode] = useState(true);
//   const [isExecutingCode, setIsExecutingCode] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isSaved, setIsSaved] = useState(false);
//   const [isGeneratingLink, setIsGeneratingLink] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [currentLine, setCurrentLine] = useState(1);
//   const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
//   const [imageUrl, setImageUrl] = useState('');
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [showModeDropdown, setShowModeDropdown] = useState(false);
//   const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
//   const [fetchError, setFetchError] = useState(null);
//   const [showLoadingScreen, setShowLoadingScreen] = useState(!!token);

//   // Effect to handle loading screen for shared links
//   useEffect(() => {
//     if (token) {
//       const timer = setTimeout(() => {
//         setShowLoadingScreen(false);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [token]);

//   // Effect to load code based on token or paramLanguage
//   useEffect(() => {
//     const loadCode = async () => {
//       setIsLoadingInitialCode(true);
//       setFetchError(null);

//       if (token) {
//         try {
//           const response = await axios.get(`https://compiler-backend-e3eg.onrender.com/api/code/${token}`, {
//             timeout: 30000,
//           });
//           const { code: sharedCode, language: sharedLanguage } = response.data;
//           if (sharedCode && sharedLanguage) {
//             setCode(sharedCode);
//             setCurrentLanguage(sharedLanguage);
//             setLinkId(token);
//             setShareLink(`${window.location.origin}/code?token=${token}`);
//           } else {
//             setFetchError('Invalid shared code data.');
//             setCode(templates[paramLanguage] || '');
//             setCurrentLanguage(paramLanguage);
//           }
//         } catch (error) {
//           console.error('Failed to load shared code:', error.message, error.response?.data);
//           setFetchError('Failed to load shared code. Error: ' + (error.response?.data?.error || error.message));
//           setCode(templates[paramLanguage] || '');
//           setCurrentLanguage(paramLanguage);
//         } finally {
//           setIsLoadingInitialCode(false);
//         }
//       } else {
//         if (paramLanguage && templates[paramLanguage]) {
//           setCode(templates[paramLanguage]);
//           setCurrentLanguage(paramLanguage);
//           setIsLoadingInitialCode(false);
//         } else {
//           setFetchError('No language specified or invalid language.');
//           setIsLoadingInitialCode(false);
//         }
//       }
//     };

//     loadCode();
//   }, [token, paramLanguage]);

//   const lineNumbers = code.split('\n').map((_, index) => index + 1);

//   const languageKeywords = {
//     python: [
//       { caption: 'print', value: 'print', meta: 'keyword' },
//       { caption: 'def', value: 'def', meta: 'keyword' },
//       { caption: 'import', value: 'import', meta: 'keyword' },
//     ],
//     javascript: [
//       { caption: 'console', value: 'console', meta: 'keyword' },
//       { caption: 'console.log', value: 'console.log', meta: 'keyword' },
//       { caption: 'let', value: 'let', meta: 'keyword' },
//     ],
//     cpp: [
//       { caption: '#include', value: '#include', meta: 'keyword' },
//       { caption: '<iostream>', value: '<iostream>', meta: 'keyword' },
//       { caption: 'using namespace std', value: 'using namespace std', meta: 'keyword' },
//     ],
//     c: [
//       { caption: '#include', value: '#include', meta: 'keyword' },
//       { caption: '<stdio.h>', value: '<stdio.h>', meta: 'keyword' },
//       { caption: 'int', value: 'int', meta: 'keyword' },
//     ],
//     java: [
//       { caption: 'public', value: 'public', meta: 'keyword' },
//       { caption: 'class', value: 'class', meta: 'keyword' },
//       { caption: 'static', value: 'static', meta: 'keyword' },
//     ],
//   };

//   const themes = [
//     { name: 'Light Mode', value: 'light' },
//     { name: 'Dark Mode', value: 'dark' },
//     { name: 'Dracula Mode', value: 'dracula' },
//     { name: 'Tokyo Night Mode', value: 'tokyo-night' },
//     { name: 'Nord Mode', value: 'nord' },
//     { name: 'Custom Neon Mode', value: 'custom-neon' },
//   ];

//   useEffect(() => {
//     const textarea = textareaRef.current;
//     const lineNumbersElem = lineNumbersRef.current;
//     const highlight = highlightRef.current;

//     const handleScroll = () => {
//       if (textarea && lineNumbersElem && highlight) {
//         lineNumbersElem.scrollTop = textarea.scrollTop;
//         const lineHeight = 24;
//         const paddingTop = 20;
//         highlight.style.top = `${(currentLine - 1) * lineHeight + paddingTop - textarea.scrollTop}px`;
//       }
//     };

//     if (textarea) {
//       textarea.addEventListener('scroll', handleScroll);
//     }

//     return () => {
//       if (textarea) {
//         textarea.removeEventListener('scroll', handleScroll);
//       }
//     };
//   }, [currentLine, code]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
//         setSuggestions([]);
//         setSelectedSuggestionIndex(-1);
//       }
//       if (modalRef.current && !modalRef.current.contains(event.target) && showImageModal) {
//         setShowImageModal(false);
//       }
//       if (!event.target.closest('.mode-toggle') && !event.target.closest('.mode-dropdown')) {
//         setShowModeDropdown(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showImageModal]);

//   const getCaretCoordinates = (element, position) => {
//     const { value } = element;
//     const lines = value.substring(0, position).split('\n');
//     const currentLineText = lines[lines.length - 1];
//     const lineNumber = lines.length;

//     const fontSize = parseInt(getComputedStyle(element).fontSize) || 14;
//     const lineHeight = parseInt(getComputedStyle(element).lineHeight) || 24;
//     const charWidth = fontSize * 0.6;

//     const top = (lineNumber - 1) * lineHeight - element.scrollTop + 20;
//     const left = currentLineText.length * charWidth - element.scrollLeft + 40;

//     return { top, left };
//   };

//   const handleCodeChange = (e) => {
//     const newCode = e.target.value;
//     setCode(newCode);
//     setShowOutput(false);

//     const cursorPosition = e.target.selectionStart;
//     const textBeforeCursor = newCode.substring(0, cursorPosition);

//     const linesBeforeCursor = textBeforeCursor.split('\n');
//     setCurrentLine(linesBeforeCursor.length);

//     if (textareaRef.current) {
//       const textarea = textareaRef.current;
//       const cursorPos = getCaretCoordinates(textarea, cursorPosition);
//       const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
//       const top = cursorPos.top + lineHeight + 10;
//       const left = cursorPos.left;
//       setSuggestionPosition({ top, left });
//     }

//     const lastWordMatch = textBeforeCursor.match(/[\w\.]+$/);
//     const lastWord = lastWordMatch ? lastWordMatch[0].toLowerCase() : '';

//     const keywords = languageKeywords[currentLanguage] || [];
//     const filteredSuggestions = keywords
//       .filter((item) => item.value.toLowerCase().startsWith(lastWord))
//       .slice(0, 5);

//     if (lastWord) {
//       setSuggestions(filteredSuggestions);
//       setSelectedSuggestionIndex(-1);
//     } else {
//       setSuggestions([]);
//       setSelectedSuggestionIndex(-1);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.ctrlKey && e.key === 'Enter') {
//       e.preventDefault();
//       handleRun();
//     }

//     if (suggestions.length > 0) {
//       if (e.key === 'ArrowDown') {
//         e.preventDefault();
//         setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
//       } else if (e.key === 'ArrowUp') {
//         e.preventDefault();
//         setSelectedSuggestionIndex((prev) => (prev > -1 ? prev - 1 : -1));
//       } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
//         e.preventDefault();
//         insertSuggestion(suggestions[selectedSuggestionIndex]);
//       } else if (e.key === ' ' || e.key === 'Enter') {
//         setSuggestions([]);
//         setSelectedSuggestionIndex(-1);
//       }
//     }
//   };

//   const insertSuggestion = (suggestion) => {
//     const textarea = textareaRef.current;
//     const cursorPosition = textarea.selectionStart;
//     const textBeforeCursor = code.substring(0, cursorPosition);

//     const lastWordMatch = textBeforeCursor.match(/[\w\.]+$/);
//     const lastWord = lastWordMatch ? lastWordMatch[0] : '';
//     const lastWordStart = lastWord ? textBeforeCursor.lastIndexOf(lastWord) : cursorPosition;
//     const textAfterCursor = code.substring(cursorPosition);

//     const newCode = code.substring(0, lastWordStart) + suggestion.value + textAfterCursor;

//     setCode(newCode);
//     setSuggestions([]);
//     setSelectedSuggestionIndex(-1);

//     setTimeout(() => {
//       textarea.focus();
//       textarea.selectionStart = lastWordStart + suggestion.value.length;
//       textarea.selectionEnd = lastWordStart + suggestion.value.length;
//     }, 0);
//   };

//   const handleRun = async () => {
//     setShowOutput(true);
//     setShowShareLink(false);
//     setIsExecutingCode(true);
//     setOutput('');
//     setImageUrl('');
//     setHasOutput(true);

//     try {
//       const response = await axios.post('https://compiler-backend-e3eg.onrender.com/api/code/execute', { code, language: currentLanguage }, {
//         headers: { 'Content-Type': 'application/json' },
//         timeout: 30000,
//       });
//       if (typeof response.data === 'object' && response.data !== null) {
//         const { output: responseOutput, error, imageUrl: responseImageUrl } = response.data;
//         if (error) {
//           setOutput(error);
//           setIsError(true);
//         } else {
//           setOutput(responseOutput || 'No output');
//           setIsError(false);
//         }
//         setImageUrl(responseImageUrl ? `https://compiler-backend-e3eg.onrender.com${responseImageUrl}` : '');
//       } else {
//         setOutput(response.data || 'No output');
//         setIsError(false);
//       }
//       setIsExecutingCode(false);
//     } catch (error) {
//       console.error('Run error:', error.message, error.response?.data);
//       const errorMessage = error.response?.data?.error || error.message || 'Failed to execute code. Please check the backend server.';
//       setOutput(errorMessage);
//       setIsError(true);
//       setIsExecutingCode(false);
//     }
//   };

//   const handleSave = async () => {
//     setIsSaving(true);
//     setIsSaved(false);
//     setIsGeneratingLink(true);

//     try {
//       const response = await axios.post('https://compiler-backend-e3eg.onrender.com/api/code/save', { code, language: currentLanguage }, {
//         headers: { 'Content-Type': 'application/json' },
//         timeout: 15000,
//       });
//       const { token } = response.data;
//       setLinkId(token);
//       const frontendBaseUrl = window.location.origin;
//       setShareLink(`${frontendBaseUrl}/code?token=${token}`);
//       setIsSaved(true);
//       setIsGeneratingLink(false);
//       setTimeout(() => setIsSaved(false), 2000);
//     } catch (error) {
//       console.error('Save error:', error.message, error.response?.data);
//       alert('Failed to save code. Please try again. Error: ' + (error.response?.data?.error || error.message));
//       setIsSaving(false);
//       setIsSaved(false);
//       setIsGeneratingLink(false);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDownloadCode = () => {
//     const fileExtension = {
//       python: 'py',
//       javascript: 'js',
//       cpp: 'cpp',
//       c: 'c',
//       java: 'java',
//     }[currentLanguage];

//     const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
//     saveAs(blob, `code.${fileExtension}`);
//   };

//   const handleDownloadImage = () => {
//     if (imageUrl) {
//       saveAs(imageUrl, imageUrl.split('/').pop());
//     }
//   };

//   const handleShare = () => {
//     if (!shareLink) {
//       alert('Please save your code before sharing!');
//       return;
//     }
//     setShowShareLink(true);
//   };

//   const handleCopyToClipboard = () => {
//     if (shareLink) {
//       navigator.clipboard.writeText(shareLink);
//       alert('Link copied to clipboard!');
//       setTimeout(() => setShowShareLink(false), 500);
//     }
//   };

//   const hideOutput = () => {
//     setShowOutput(false);
//     setImageUrl('');
//   };

//   const openImageModal = () => {
//     if (imageUrl) {
//       setShowImageModal(true);
//     }
//   };

//   const toggleOutput = () => {
//     setShowOutput(!showOutput);
//   };

//   const toggleModeDropdown = () => {
//     setShowModeDropdown(!showModeDropdown);
//   };

//   const handleModeSelect = (modeValue) => {
//     setMode(modeValue);
//     setShowModeDropdown(false);
//   };

//   if (showLoadingScreen) {
//     return <LoadingScreen />;
//   }

//   if (isLoadingInitialCode) {
//     return (
//       <div className="full-screen-message">
//         <h2>Loading code...</h2>
//       </div>
//     );
//   }

//   if (fetchError) {
//     return (
//       <div className="full-screen-message error-message">
//         <h2>Error: {fetchError}</h2>
//         <button onClick={() => navigate('/')}>Go Back</button>
//       </div>
//     );
//   }

//   if (!currentLanguage || !templates[currentLanguage]) {
//     return (
//       <div className="full-screen-message error-message">
//         <h2>Error: Invalid language selected or failed to determine language.</h2>
//         <button onClick={() => navigate('/')}>Go Back</button>
//       </div>
//     );
//   }

//   return (
//     <motion.div className="editor-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
//       <nav className={`navbar ${mode}`}>
//         <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>KODE SMITH</h1>
//       </nav>
//       <div className={`action-bar ${mode}`}>
//         <button onClick={handleRun} className={`action-btn ${mode}`}>
//           <i className="fa-solid fa-play"></i> Run (Ctrl+Enter)
//         </button>
//         <div className="mode-toggle-container">
//           <button onClick={toggleModeDropdown} className={`mode-toggle ${mode}`}>
//             <i className="fa-solid fa-palette"></i> Theme
//           </button>
//           {showModeDropdown && (
//             <motion.div
//               className={`mode-dropdown ${mode}`}
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.3 }}
//             >
//               {themes.map((theme) => (
//                 <div key={theme.value} className={`mode-dropdown-item ${mode}`} onClick={() => handleModeSelect(theme.value)}>
//                   {theme.name}
//                 </div>
//               ))}
//             </motion.div>
//           )}
//         </div>
//         <button onClick={handleSave} className={`action-btn ${mode}`}>
//           <i className="fa-solid fa-save"></i> Save
//         </button>
//         <button onClick={handleDownloadCode} className={`action-btn ${mode}`}>
//           <i className="fa-solid fa-download"></i> Download
//         </button>
//         <div className="share-container">
//           <button onClick={handleShare} className={`action-btn ${mode}`}>
//             <i className="fa-solid fa-share-alt"></i> Share
//           </button>
//           {showShareLink && (
//             <motion.div
//               className={`share-link ${mode}`}
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.8 }}
//               transition={{ duration: 0.3 }}
//             >
//               <p>
//                 <span>{shareLink}</span>
//                 <i className="fa-solid fa-copy copy-icon" onClick={handleCopyToClipboard} style={{ cursor: 'pointer', marginLeft: '10px' }}></i>
//               </p>
//             </motion.div>
//           )}
//         </div>
//       </div>
//       <div className="editor-container">
//         <div className={`editor-section ${mode}`}>
//           <div className="editor-wrapper" ref={editorWrapperRef}>
//             <div className={`line-numbers ${mode}`} ref={lineNumbersRef}>
//               {lineNumbers.map((number) => (
//                 <div key={number} className={`line-number ${number === currentLine ? 'current-line' : ''}`}>
//                   {number}
//                 </div>
//               ))}
//             </div>
//             <div className="code-editor-wrapper">
//               <div className={`current-line-highlight ${mode}`} ref={highlightRef} style={{ top: `${(currentLine - 1) * 24 + 20}px`, height: '24px' }} />
//               <textarea
//                 id="code-editor"
//                 className={`code-editor ${mode}`}
//                 ref={textareaRef}
//                 value={code}
//                 onChange={handleCodeChange}
//                 onKeyDown={handleKeyDown}
//                 onClick={hideOutput}
//                 spellCheck="false"
//               />
//             </div>
//           </div>
//           {suggestions.length > 0 && (
//             <div
//               className={`recommendation-container ${mode}`}
//               style={{ top: suggestionPosition.top, left: suggestionPosition.left }}
//               ref={suggestionRef}
//             >
//               {suggestions.map((suggestion, index) => (
//                 <div
//                   key={index}
//                   className={`recommendation-item ${index === selectedSuggestionIndex ? 'selected' : ''} ${mode}`}
//                   onClick={() => insertSuggestion(suggestion)}
//                 >
//                   <span className={`recommendation-value ${mode}`}>{suggestion.value}</span>
//                   <span className={`recommendation-meta ${mode}`}>{suggestion.meta}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       {isSaving && (
//         <motion.div className={`notification ${mode}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
//           Code is saving...
//         </motion.div>
//       )}
//       {isSaved && (
//         <motion.div className={`notification ${mode}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
//           Code saved!
//         </motion.div>
//       )}
//       {isGeneratingLink && (
//         <motion.div className={`notification ${mode}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
//           Generating link...
//         </motion.div>
//       )}
//       {hasOutput && (
//         <motion.div
//           className={`output-section ${isError ? 'error' : 'success'} ${showOutput ? 'show' : ''} ${mode}`}
//           initial={{ transform: 'translateY(100%)' }}
//           animate={{ transform: showOutput ? 'translateY(0)' : 'translateY(100%)' }}
//           transition={{ duration: 0.3 }}
//         >
//           <h3>Output:</h3>
//           {isExecutingCode ? (
//             <div className="loading-spinner">Loading...</div>
//           ) : (
//             <div className="output-content">
//               <pre>{output}</pre>
//               {imageUrl && (
//                 <div className="output-image">
//                   <img src={imageUrl} alt="Output Image" onClick={openImageModal} style={{ cursor: 'pointer' }} />
//                 </div>
//               )}
//             </div>
//           )}
//         </motion.div>
//       )}
//       {hasOutput && (
//         <motion.button
//           className={`toggle-output-btn ${mode}`}
//           onClick={toggleOutput}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           <i className={`fa-solid ${showOutput ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
//         </motion.button>
//       )}
//       {showImageModal && (
//         <motion.div
//           className="image-modal"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           <div className={`image-modal-content ${mode}`} ref={modalRef}>
//             <img src={imageUrl} alt="Full Screen Output Image" />
//             <div className="image-modal-actions">
//               <button onClick={handleDownloadImage} className={`action-btn ${mode}`}>
//                 <i className="fa-solid fa-download"></i> Download Image
//               </button>
//               <button onClick={() => setShowImageModal(false)} className={`action-btn ${mode}`}>
//                 <i className="fa-solid fa-times"></i> Close
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// };

// // Main App Component
// const App = () => {
//   const [showSplash, setShowSplash] = useState(true);
//   const [mode, setMode] = useState('dark');

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowSplash(false);
//     }, 3000);
//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <Router>
//       <div className={`app ${mode}`}>
//         <AnimatePresence>
//           {showSplash ? (
//             <SplashScreen key="splash" />
//           ) : (
//             <Routes>
//               <Route path="/" element={<MainScreen mode={mode} />} />
//               <Route
//                 path="/editor/:language"
//                 element={
//                   <ErrorBoundary>
//                     <EditorScreen mode={mode} setMode={setMode} />
//                   </ErrorBoundary>
//                 }
//               />
//               <Route
//                 path="/code"
//                 element={
//                   <ErrorBoundary>
//                     <EditorScreen mode={mode} setMode={setMode} />
//                   </ErrorBoundary>
//                 }
//               />
//               <Route path="*" element={<div className="not-found-page"><h2>404: Page Not Found</h2><button onClick={() => window.location.href = '/'}>Go Home</button></div>} />
//             </Routes>
//           )}
//         </AnimatePresence>
//       </div>
//     </Router>
//   );
// };

// export default App;


// import { useState, useEffect, Component, useRef } from 'react';
// import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { saveAs } from 'file-saver';
// import { motion, AnimatePresence } from 'framer-motion';
// import './App.css';

// // Move templates outside the component to avoid initialization issues
// const templates = {
//   python: `# Welcome to Kode Smith! 🎉\n#\n# Python: The language of simplicity and power, perfect for AI, data science, and automation.\n#\n# Code with clarity, create with ease—Python is your gateway to endless possibilities.\n#\n\nprint("Hello Duniya")`,
//   javascript: `// Welcome to Kode Smith! 🎉\n// \n// JavaScript: Bring the web to life with dynamic, interactive experiences.\n// \n// From front-end flair to back-end brilliance—JavaScript powers it all.\n// \n\nconsole.log("Hello, World!");`,
//   cpp: `/*\n * Welcome to Kode Smith! 🎉\n *\n * C++: The language of speed and control, ideal for games, systems, and performance-driven apps.\n *\n * Harness the power of C++—where precision meets performance.\n *\n * Happy Coding! 🚀\n */\n#include <iostream>\nint main() {\n    std::cout << "Hello, World!\\n";\n    return 0;\n}`,
//   c: `/*\n * Welcome to Kode Smith! 🎉\n *\n * C: The foundation of modern programming, built for speed and low-level control.\n *\n * Code close to the metal—unleash the raw power of C.\n *\n * Happy Coding! 🚀\n */\n#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
//   java: `\npublic class KodeSmith {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`
// };

// // Error Boundary to catch rendering errors in EditorScreen
// class ErrorBoundary extends Component {
//   state = { hasError: false, error: null };

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error("ErrorBoundary caught an error:", error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="error-boundary">
//           <h2>Something went wrong in EditorScreen:</h2>
//           <pre>{this.state.error?.toString()}</pre>
//           <button onClick={() => window.location.href = '/'}>Go Back to Home</button>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// // Loading Screen Component for shared links
// const LoadingScreen = () => {
//   return (
//     <div className="loading-screen">
//       <div className="loading-content">
//         <h1>Loading Code</h1>
//       </div>
//     </div>
//   );
// };

// // SplashScreen Component
// const SplashScreen = () => {
//   return (
//     <div className="splash-screen">
//       <div className="splash-content">
//         <img src="/logo3.png" alt="Kode Smith Logo" className="splash-logo" />
//         <h1 className="fade-text">KODE SMITH</h1>
//       </div>
//     </div>
//   );
// };

// // MainScreen Component
// const MainScreen = ({ mode }) => {
//   const navigate = useNavigate();
//   const languages = [
//     { name: 'python', label: 'Python', icon: 'fa-brands fa-python' },
//     { name: 'javascript', label: 'JavaScript', icon: 'fa-brands fa-js' },
//     { name: 'cpp', label: 'C++', icon: 'fa-solid fa-code' },
//     { name: 'c', label: 'C', icon: 'fa-solid fa-code' },
//     { name: 'java', label: 'Java', icon: 'fa-brands fa-java' },
//   ];

//   return (
//     <motion.div
//       className="main-screen"
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8 }}
//     >
//       <h1>Compiler is ready ⚙️ choose your command language!</h1>
//       <div className="language-cards">
//         {languages.map((lang) => (
//           <motion.div
//             key={lang.name}
//             className="language-card"
//             whileHover={{ scale: 1.1, rotate: 2 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => navigate(`/editor/${lang.name}`)}
//           >
//             <i className={lang.icon}></i>
//             <h3>{lang.label}</h3>
//           </motion.div>
//         ))}
//       </div>
//     </motion.div>
//   );
// };

// // EditorScreen Component
// const EditorScreen = ({ mode, setMode }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { language: paramLanguage } = useParams();
//   const textareaRef = useRef(null);
//   const suggestionRef = useRef(null);
//   const editorWrapperRef = useRef(null);
//   const lineNumbersRef = useRef(null);
//   const highlightRef = useRef(null);
//   const modalRef = useRef(null);
  
//   const searchParams = new URLSearchParams(location.search);
//   const token = searchParams.get('token');

//   const [code, setCode] = useState('');
//   const [currentLanguage, setCurrentLanguage] = useState(paramLanguage);
//   const [output, setOutput] = useState('');
//   const [isError, setIsError] = useState(false);
//   const [shareLink, setShareLink] = useState('');
//   const [linkId, setLinkId] = useState('');
//   const [showOutput, setShowOutput] = useState(false);
//   const [hasOutput, setHasOutput] = useState(false);
//   const [showShareLink, setShowShareLink] = useState(false);
//   const [isLoadingInitialCode, setIsLoadingInitialCode] = useState(true);
//   const [isExecutingCode, setIsExecutingCode] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isSaved, setIsSaved] = useState(false);
//   const [isGeneratingLink, setIsGeneratingLink] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [currentLine, setCurrentLine] = useState(1);
//   const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
//   const [imageUrl, setImageUrl] = useState('');
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [showModeDropdown, setShowModeDropdown] = useState(false);
//   const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
//   const [fetchError, setFetchError] = useState(null);
//   const [showLoadingScreen, setShowLoadingScreen] = useState(!!token);

//   // Effect to handle loading screen for shared links
//   useEffect(() => {
//     if (token) {
//       const timer = setTimeout(() => {
//         setShowLoadingScreen(false);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [token]);

//   // Effect to load code based on token or paramLanguage
//   useEffect(() => {
//     const loadCode = async () => {
//       setIsLoadingInitialCode(true);
//       setFetchError(null);

//       if (token) {
//         try {
//           const response = await axios.get(`https://compiler-backend-e3eg.onrender.com/api/code/${token}`, {
//             timeout: 30000,
//           });
//           const { code: sharedCode, language: sharedLanguage } = response.data;
//           if (sharedCode && sharedLanguage) {
//             setCode(sharedCode);
//             setCurrentLanguage(sharedLanguage);
//             setLinkId(token);
//             setShareLink(`${window.location.origin}/code?token=${token}`);
//           } else {
//             setFetchError('Invalid shared code data.');
//             setCode(templates[paramLanguage] || '');
//             setCurrentLanguage(paramLanguage);
//           }
//         } catch (error) {
//           console.error('Failed to load shared code:', error.message, error.response?.data);
//           setFetchError('Failed to load shared code. Error: ' + (error.response?.data?.error || error.message));
//           setCode(templates[paramLanguage] || '');
//           setCurrentLanguage(paramLanguage);
//         } finally {
//           setIsLoadingInitialCode(false);
//         }
//       } else {
//         if (paramLanguage && templates[paramLanguage]) {
//           setCode(templates[paramLanguage]);
//           setCurrentLanguage(paramLanguage);
//           setIsLoadingInitialCode(false);
//         } else {
//           setFetchError('No language specified or invalid language.');
//           setIsLoadingInitialCode(false);
//         }
//       }
//     };

//     loadCode();
//   }, [token, paramLanguage]);

//   const lineNumbers = code.split('\n').map((_, index) => index + 1);

//   const languageKeywords = {
//     python: [
//       { caption: 'def', value: 'def', meta: 'token-keyword' },
//       { caption: 'return', value: 'return', meta: 'token-keyword' },
//       { caption: 'if', value: 'if', meta: 'token-keyword' },
//       { caption: 'else', value: 'else', meta: 'token-keyword' },
//       { caption: 'elif', value: 'elif', meta: 'token-keyword' },
//       { caption: 'for', value: 'for', meta: 'token-keyword' },
//       { caption: 'while', value: 'while', meta: 'token-keyword' },
//       { caption: 'break', value: 'break', meta: 'token-keyword' },
//       { caption: 'continue', value: 'continue', meta: 'token-keyword' },
//       { caption: 'import', value: 'import', meta: 'token-keyword' },
//       { caption: 'from', value: 'from', meta: 'token-keyword' },
//       { caption: 'as', value: 'as', meta: 'token-keyword' },
//       { caption: 'try', value: 'try', meta: 'token-keyword' },
//       { caption: 'except', value: 'except', meta: 'token-keyword' },
//       { caption: 'finally', value: 'finally', meta: 'token-keyword' },
//       { caption: 'with', value: 'with', meta: 'token-keyword' },
//       { caption: 'pass', value: 'pass', meta: 'token-keyword' },
//       { caption: 'raise', value: 'raise', meta: 'token-keyword' },
//       { caption: 'lambda', value: 'lambda', meta: 'token-keyword' },
//       { caption: 'yield', value: 'yield', meta: 'token-keyword' },
//       { caption: 'global', value: 'global', meta: 'token-keyword' },
//       { caption: 'nonlocal', value: 'nonlocal', meta: 'token-keyword' },
//       { caption: 'True', value: 'True', meta: 'token-constant' },
//       { caption: 'False', value: 'False', meta: 'token-constant' },
//       { caption: 'None', value: 'None', meta: 'token-constant' },
//       { caption: 'and', value: 'and', meta: 'token-operator' },
//       { caption: 'or', value: 'or', meta: 'token-operator' },
//       { caption: 'not', value: 'not', meta: 'token-operator' },
//       { caption: 'is', value: 'is', meta: 'token-operator' },
//       { caption: 'in', value: 'in', meta: 'token-operator' },
//       { caption: 'class', value: 'class', meta: 'token-keyword' },
//       { caption: 'self', value: 'self', meta: 'token-keyword' },
//       { caption: 'print', value: 'print', meta: 'token-function' },
//       { caption: 'input', value: 'input', meta: 'token-function' },
//       { caption: 'len', value: 'len', meta: 'token-function' },
//       { caption: 'range', value: 'range', meta: 'token-function' },
//       { caption: 'open', value: 'open', meta: 'token-function' },
//       { caption: 'read', value: 'read', meta: 'token-function' },
//       { caption: 'write', value: 'write', meta: 'token-function' },
//       { caption: 'append', value: 'append', meta: 'token-function' },
//       { caption: 'dict', value: 'dict', meta: 'token-type' },
//       { caption: 'list', value: 'list', meta: 'token-type' },
//       { caption: 'tuple', value: 'tuple', meta: 'token-type' },
//       { caption: 'set', value: 'set', meta: 'token-type' },
//       { caption: 'int', value: 'int', meta: 'token-type' },
//       { caption: 'float', value: 'float', meta: 'token-type' },
//       { caption: 'str', value: 'str', meta: 'token-type' },
//       { caption: 'bool', value: 'bool', meta: 'token-type' },
//       { caption: 'zip', value: 'zip', meta: 'token-function' },
//       { caption: 'enumerate', value: 'enumerate', meta: 'token-function' },
//     ],
//     javascript: [
//       { caption: 'let', value: 'let', meta: 'token-keyword' },
//       { caption: 'const', value: 'const', meta: 'token-keyword' },
//       { caption: 'var', value: 'var', meta: 'token-keyword' },
//       { caption: 'function', value: 'function', meta: 'token-keyword' },
//       { caption: 'return', value: 'return', meta: 'token-keyword' },
//       { caption: 'if', value: 'if', meta: 'token-keyword' },
//       { caption: 'else', value: 'else', meta: 'token-keyword' },
//       { caption: 'switch', value: 'switch', meta: 'token-keyword' },
//       { caption: 'case', value: 'case', meta: 'token-keyword' },
//       { caption: 'break', value: 'break', meta: 'token-keyword' },
//       { caption: 'continue', value: 'continue', meta: 'token-keyword' },
//       { caption: 'for', value: 'for', meta: 'token-keyword' },
//       { caption: 'while', value: 'while', meta: 'token-keyword' },
//       { caption: 'do', value: 'do', meta: 'token-keyword' },
//       { caption: 'try', value: 'try', meta: 'token-keyword' },
//       { caption: 'catch', value: 'catch', meta: 'token-keyword' },
//       { caption: 'throw', value: 'throw', meta: 'token-keyword' },
//       { caption: 'finally', value: 'finally', meta: 'token-keyword' },
//       { caption: 'import', value: 'import', meta: 'token-keyword' },
//       { caption: 'export', value: 'export', meta: 'token-keyword' },
//       { caption: 'from', value: 'from', meta: 'token-keyword' },
//       { caption: 'as', value: 'as', meta: 'token-keyword' },
//       { caption: 'new', value: 'new', meta: 'token-operator' },
//       { caption: 'class', value: 'class', meta: 'token-keyword' },
//       { caption: 'extends', value: 'extends', meta: 'token-keyword' },
//       { caption: 'super', value: 'super', meta: 'token-keyword' },
//       { caption: 'this', value: 'this', meta: 'token-keyword' },
//       { caption: 'constructor', value: 'constructor', meta: 'token-keyword' },
//       { caption: 'null', value: 'null', meta: 'token-constant' },
//       { caption: 'undefined', value: 'undefined', meta: 'token-constant' },
//       { caption: 'true', value: 'true', meta: 'token-constant' },
//       { caption: 'false', value: 'false', meta: 'token-constant' },
//       { caption: 'console.log', value: 'console.log', meta: 'token-function' },
//       { caption: 'typeof', value: 'typeof', meta: 'token-operator' },
//       { caption: 'instanceof', value: 'instanceof', meta: 'token-operator' },
//       { caption: 'await', value: 'await', meta: 'token-keyword' },
//       { caption: 'async', value: 'async', meta: 'token-keyword' },
//       { caption: 'Promise', value: 'Promise', meta: 'token-type' },
//       { caption: 'setTimeout', value: 'setTimeout', meta: 'token-function' },
//       { caption: 'setInterval', value: 'setInterval', meta: 'token-function' },
//       { caption: 'Math', value: 'Math', meta: 'token-object' },
//       { caption: 'JSON', value: 'JSON', meta: 'token-object' },
//       { caption: 'fetch', value: 'fetch', meta: 'token-function' },
//       { caption: 'map', value: 'map', meta: 'token-function' },
//       { caption: 'filter', value: 'filter', meta: 'token-function' },
//       { caption: 'reduce', value: 'reduce', meta: 'token-function' },
//       { caption: 'document', value: 'document', meta: 'token-object' },
//       { caption: 'window', value: 'window', meta: 'token-object' },
//     ],
//     cpp: [
//       { caption: 'int', value: 'int', meta: 'token-type' },
//       { caption: 'float', value: 'float', meta: 'token-type' },
//       { caption: 'double', value: 'double', meta: 'token-type' },
//       { caption: 'char', value: 'char', meta: 'token-type' },
//       { caption: 'void', value: 'void', meta: 'token-type' },
//       { caption: 'bool', value: 'bool', meta: 'token-type' },
//       { caption: 'auto', value: 'auto', meta: 'token-keyword' },
//       { caption: 'const', value: 'const', meta: 'token-keyword' },
//       { caption: 'static', value: 'static', meta: 'token-keyword' },
//       { caption: 'extern', value: 'extern', meta: 'token-keyword' },
//       { caption: 'mutable', value: 'mutable', meta: 'token-keyword' },
//       { caption: 'volatile', value: 'volatile', meta: 'token-keyword' },
//       { caption: 'return', value: 'return', meta: 'token-keyword' },
//       { caption: 'if', value: 'if', meta: 'token-keyword' },
//       { caption: 'else', value: 'else', meta: 'token-keyword' },
//       { caption: 'switch', value: 'switch', meta: 'token-keyword' },
//       { caption: 'case', value: 'case', meta: 'token-keyword' },
//       { caption: 'default', value: 'default', meta: 'token-keyword' },
//       { caption: 'break', value: 'break', meta: 'token-keyword' },
//       { caption: 'continue', value: 'continue', meta: 'token-keyword' },
//       { caption: 'while', value: 'while', meta: 'token-keyword' },
//       { caption: 'do', value: 'do', meta: 'token-keyword' },
//       { caption: 'for', value: 'for', meta: 'token-keyword' },
//       { caption: 'new', value: 'new', meta: 'token-operator' },
//       { caption: 'delete', value: 'delete', meta: 'token-operator' },
//       { caption: 'try', value: 'try', meta: 'token-keyword' },
//       { caption: 'catch', value: 'catch', meta: 'token-keyword' },
//       { caption: 'throw', value: 'throw', meta: 'token-keyword' },
//       { caption: 'noexcept', value: 'noexcept', meta: 'token-keyword' },
//       { caption: 'inline', value: 'inline', meta: 'token-keyword' },
//       { caption: 'namespace', value: 'namespace', meta: 'token-keyword' },
//       { caption: 'using', value: 'using', meta: 'token-keyword' },
//       { caption: 'std', value: 'std', meta: 'token-namespace' },
//       { caption: 'class', value: 'class', meta: 'token-keyword' },
//       { caption: 'struct', value: 'struct', meta: 'token-keyword' },
//       { caption: 'public', value: 'public', meta: 'token-keyword' },
//       { caption: 'private', value: 'private', meta: 'token-keyword' },
//       { caption: 'protected', value: 'protected', meta: 'token-keyword' },
//       { caption: 'friend', value: 'friend', meta: 'token-keyword' },
//       { caption: 'virtual', value: 'virtual', meta: 'token-keyword' },
//       { caption: 'override', value: 'override', meta: 'token-keyword' },
//       { caption: 'template', value: 'template', meta: 'token-keyword' },
//       { caption: 'typename', value: 'typename', meta: 'token-keyword' },
//       { caption: 'operator', value: 'operator', meta: 'token-operator' },
//       { caption: 'this', value: 'this', meta: 'token-keyword' },
//       { caption: 'nullptr', value: 'nullptr', meta: 'token-constant' },
//       { caption: 'cout', value: 'cout', meta: 'token-object' },
//       { caption: 'cin', value: 'cin', meta: 'token-object' },
//       { caption: 'endl', value: 'endl', meta: 'token-object' },
//       { caption: '#include', value: '#include', meta: 'token-keyword' },
//       { caption: 'vector', value: 'vector', meta: 'token-type' },
//       { caption: 'map', value: 'map', meta: 'token-type' },
//     ],
//     c: [
//       { caption: 'int', value: 'int', meta: 'token-type' },
//       { caption: 'float', value: 'float', meta: 'token-type' },
//       { caption: 'double', value: 'double', meta: 'token-type' },
//       { caption: 'char', value: 'char', meta: 'token-type' },
//       { caption: 'void', value: 'void', meta: 'token-type' },
//       { caption: 'short', value: 'short', meta: 'token-type' },
//       { caption: 'long', value: 'long', meta: 'token-type' },
//       { caption: 'signed', value: 'signed', meta: 'token-type' },
//       { caption: 'unsigned', value: 'unsigned', meta: 'token-type' },
//       { caption: 'const', value: 'const', meta: 'token-keyword' },
//       { caption: 'static', value: 'static', meta: 'token-keyword' },
//       { caption: 'extern', value: 'extern', meta: 'token-keyword' },
//       { caption: 'volatile', value: 'volatile', meta: 'token-keyword' },
//       { caption: 'auto', value: 'auto', meta: 'token-keyword' },
//       { caption: 'register', value: 'register', meta: 'token-keyword' },
//       { caption: 'return', value: 'return', meta: 'token-keyword' },
//       { caption: 'if', value: 'if', meta: 'token-keyword' },
//       { caption: 'else', value: 'else', meta: 'token-keyword' },
//       { caption: 'switch', value: 'switch', meta: 'token-keyword' },
//       { caption: 'case', value: 'case', meta: 'token-keyword' },
//       { caption: 'default', value: 'default', meta: 'token-keyword' },
//       { caption: 'break', value: 'break', meta: 'token-keyword' },
//       { caption: 'continue', value: 'continue', meta: 'token-keyword' },
//       { caption: 'while', value: 'while', meta: 'token-keyword' },
//       { caption: 'do', value: 'do', meta: 'token-keyword' },
//       { caption: 'for', value: 'for', meta: 'token-keyword' },
//       { caption: 'goto', value: 'goto', meta: 'token-keyword' },
//       { caption: 'sizeof', value: 'sizeof', meta: 'token-operator' },
//       { caption: 'typedef', value: 'typedef', meta: 'token-keyword' },
//       { caption: 'struct', value: 'struct', meta: 'token-keyword' },
//       { caption: 'union', value: 'union', meta: 'token-keyword' },
//       { caption: 'enum', value: 'enum', meta: 'token-keyword' },
//       { caption: '#include', value: '#include', meta: 'token-keyword' },
//       { caption: '#define', value: '#define', meta: 'token-keyword' },
//       { caption: '#if', value: '#if', meta: 'token-keyword' },
//       { caption: '#endif', value: '#endif', meta: 'token-keyword' },
//       { caption: '#else', value: '#else', meta: 'token-keyword' },
//       { caption: '#elif', value: '#elif', meta: 'token-keyword' },
//       { caption: 'printf', value: 'printf', meta: 'token-function' },
//       { caption: 'scanf', value: 'scanf', meta: 'token-function' },
//       { caption: 'main', value: 'main', meta: 'token-function' },
//       { caption: 'NULL', value: 'NULL', meta: 'token-constant' },
//       { caption: 'stdin', value: 'stdin', meta: 'token-object' },
//       { caption: 'stdout', value: 'stdout', meta: 'token-object' },
//       { caption: 'stderr', value: 'stderr', meta: 'token-object' },
//       { caption: 'fopen', value: 'fopen', meta: 'token-function' },
//       { caption: 'fclose', value: 'fclose', meta: 'token-function' },
//       { caption: 'malloc', value: 'malloc', meta: 'token-function' },
//       { caption: 'free', value: 'free', meta: 'token-function' },
//       { caption: 'memcpy', value: 'memcpy', meta: 'token-function' },
//       { caption: 'memset', value: 'memset', meta: 'token-function' },
//       { caption: 'exit', value: 'exit', meta: 'token-function' },
//     ],
//     java: [
//       { caption: 'int', value: 'int', meta: 'token-type' },
//       { caption: 'float', value: 'float', meta: 'token-type' },
//       { caption: 'double', value: 'double', meta: 'token-type' },
//       { caption: 'char', value: 'char', meta: 'token-type' },
//       { caption: 'boolean', value: 'boolean', meta: 'token-type' },
//       { caption: 'void', value: 'void', meta: 'token-type' },
//       { caption: 'static', value: 'static', meta: 'token-keyword' },
//       { caption: 'final', value: 'final', meta: 'token-keyword' },
//       { caption: 'public', value: 'public', meta: 'token-keyword' },
//       { caption: 'private', value: 'private', meta: 'token-keyword' },
//       { caption: 'protected', value: 'protected', meta: 'token-keyword' },
//       { caption: 'class', value: 'class', meta: 'token-keyword' },
//       { caption: 'interface', value: 'interface', meta: 'token-keyword' },
//       { caption: 'extends', value: 'extends', meta: 'token-keyword' },
//       { caption: 'implements', value: 'implements', meta: 'token-keyword' },
//       { caption: 'abstract', value: 'abstract', meta: 'token-keyword' },
//       { caption: 'return', value: 'return', meta: 'token-keyword' },
//       { caption: 'if', value: 'if', meta: 'token-keyword' },
//       { caption: 'else', value: 'else', meta: 'token-keyword' },
//       { caption: 'switch', value: 'switch', meta: 'token-keyword' },
//       { caption: 'case', value: 'case', meta: 'token-keyword' },
//       { caption: 'default', value: 'default', meta: 'token-keyword' },
//       { caption: 'break', value: 'break', meta: 'token-keyword' },
//       { caption: 'continue', value: 'continue', meta: 'token-keyword' },
//       { caption: 'while', value: 'while', meta: 'token-keyword' },
//       { caption: 'do', value: 'do', meta: 'token-keyword' },
//       { caption: 'for', value: 'for', meta: 'token-keyword' },
//       { caption: 'try', value: 'try', meta: 'token-keyword' },
//       { caption: 'catch', value: 'catch', meta: 'token-keyword' },
//       { caption: 'throw', value: 'throw', meta: 'token-keyword' },
//       { caption: 'throws', value: 'throws', meta: 'token-keyword' },
//       { caption: 'import', value: 'import', meta: 'token-keyword' },
//       { caption: 'package', value: 'package', meta: 'token-keyword' },
//       { caption: 'super', value: 'super', meta: 'token-keyword' },
//       { caption: 'this', value: 'this', meta: 'token-keyword' },
//       { caption: 'new', value: 'new', meta: 'token-operator' },
//       { caption: 'null', value: 'null', meta: 'token-constant' },
//       { caption: 'true', value: 'true', meta: 'token-constant' },
//       { caption: 'false', value: 'false', meta: 'token-constant' },
//       { caption: 'synchronized', value: 'synchronized', meta: 'token-keyword' },
//       { caption: 'System.out.println', value: 'System.out.println', meta: 'token-function' },
//       { caption: 'Scanner', value: 'Scanner', meta: 'token-type' },
//       { caption: 'ArrayList', value: 'ArrayList', meta: 'token-type' },
//       { caption: 'HashMap', value: 'HashMap', meta: 'token-type' },
//       { caption: 'instanceof', value: 'instanceof', meta: 'token-operator' },
//       { caption: 'enum', value: 'enum', meta: 'token-keyword' },
//       { caption: 'static import', value: 'static import', meta: 'token-keyword' },
//     ],
//   };

//   const themes = [
//     { name: 'Light Mode', value: 'light' },
//     { name: 'Dark Mode', value: 'dark' },
//     { name: 'Dracula Mode', value: 'dracula' },
//     { name: 'Tokyo Night Mode', value: 'tokyo-night' },
//     { name: 'Nord Mode', value: 'nord' },
//     { name: 'Custom Neon Mode', value: 'custom-neon' },
//   ];

//   useEffect(() => {
//     const textarea = textareaRef.current;
//     const lineNumbersElem = lineNumbersRef.current;
//     const highlight = highlightRef.current;

//     const handleScroll = () => {
//       if (textarea && lineNumbersElem && highlight) {
//         lineNumbersElem.scrollTop = textarea.scrollTop;
//         const lineHeight = 24;
//         const paddingTop = 20;
//         highlight.style.top = `${(currentLine - 1) * lineHeight + paddingTop - textarea.scrollTop}px`;
//       }
//     };

//     if (textarea) {
//       textarea.addEventListener('scroll', handleScroll);
//     }

//     return () => {
//       if (textarea) {
//         textarea.removeEventListener('scroll', handleScroll);
//       }
//     };
//   }, [currentLine, code]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
//         setSuggestions([]);
//         setSelectedSuggestionIndex(-1);
//       }
//       if (modalRef.current && !modalRef.current.contains(event.target) && showImageModal) {
//         setShowImageModal(false);
//       }
//       if (!event.target.closest('.mode-toggle') && !event.target.closest('.mode-dropdown')) {
//         setShowModeDropdown(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showImageModal]);

//   const getCaretCoordinates = (element, position) => {
//     const { value } = element;
//     const lines = value.substring(0, position).split('\n');
//     const currentLineText = lines[lines.length - 1];
//     const lineNumber = lines.length;

//     const fontSize = parseInt(getComputedStyle(element).fontSize) || 14;
//     const lineHeight = parseInt(getComputedStyle(element).lineHeight) || 24;
//     const charWidth = fontSize * 0.6;

//     const top = (lineNumber - 1) * lineHeight - element.scrollTop + 20;
//     const left = currentLineText.length * charWidth - element.scrollLeft + 40;

//     return { top, left };
//   };

//   const handleCodeChange = (e) => {
//     const newCode = e.target.value;
//     setCode(newCode);
//     setShowOutput(false);

//     const cursorPosition = e.target.selectionStart;
//     const textBeforeCursor = newCode.substring(0, cursorPosition);

//     const linesBeforeCursor = textBeforeCursor.split('\n');
//     setCurrentLine(linesBeforeCursor.length);

//     if (textareaRef.current) {
//       const textarea = textareaRef.current;
//       const cursorPos = getCaretCoordinates(textarea, cursorPosition);
//       const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
//       const top = cursorPos.top + lineHeight + 10;
//       const left = cursorPos.left;
//       setSuggestionPosition({ top, left });
//     }

//     const lastWordMatch = textBeforeCursor.match(/[\w\.]+$/);
//     const lastWord = lastWordMatch ? lastWordMatch[0].toLowerCase() : '';

//     const keywords = languageKeywords[currentLanguage] || [];
//     const filteredSuggestions = keywords
//       .filter((item) => item.value.toLowerCase().startsWith(lastWord))
//       .slice(0, 5);

//     if (lastWord) {
//       setSuggestions(filteredSuggestions);
//       setSelectedSuggestionIndex(-1);
//     } else {
//       setSuggestions([]);
//       setSelectedSuggestionIndex(-1);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.ctrlKey && e.key === 'Enter') {
//       e.preventDefault();
//       handleRun();
//     }

//     if (suggestions.length > 0) {
//       if (e.key === 'ArrowDown') {
//         e.preventDefault();
//         setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
//       } else if (e.key === 'ArrowUp') {
//         e.preventDefault();
//         setSelectedSuggestionIndex((prev) => (prev > -1 ? prev - 1 : -1));
//       } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
//         e.preventDefault();
//         insertSuggestion(suggestions[selectedSuggestionIndex]);
//       } else if (e.key === ' ' || e.key === 'Enter') {
//         setSuggestions([]);
//         setSelectedSuggestionIndex(-1);
//       }
//     }
//   };

//   const insertSuggestion = (suggestion) => {
//     const textarea = textareaRef.current;
//     const cursorPosition = textarea.selectionStart;
//     const textBeforeCursor = code.substring(0, cursorPosition);

//     const lastWordMatch = textBeforeCursor.match(/[\w\.]+$/);
//     const lastWord = lastWordMatch ? lastWordMatch[0] : '';
//     const lastWordStart = lastWord ? textBeforeCursor.lastIndexOf(lastWord) : cursorPosition;
//     const textAfterCursor = code.substring(cursorPosition);

//     const newCode = code.substring(0, lastWordStart) + suggestion.value + textAfterCursor;

//     setCode(newCode);
//     setSuggestions([]);
//     setSelectedSuggestionIndex(-1);

//     setTimeout(() => {
//       textarea.focus();
//       textarea.selectionStart = lastWordStart + suggestion.value.length;
//       textarea.selectionEnd = lastWordStart + suggestion.value.length;
//     }, 0);
//   };

//   const handleRun = async () => {
//     setShowOutput(true);
//     setShowShareLink(false);
//     setIsExecutingCode(true);
//     setOutput('');
//     setImageUrl('');
//     setHasOutput(true);

//     try {
//       const response = await axios.post('https://compiler-backend-e3eg.onrender.com/api/code/execute', { code, language: currentLanguage }, {
//         headers: { 'Content-Type': 'application/json' },
//         timeout: 30000,
//       });
//       if (typeof response.data === 'object' && response.data !== null) {
//         const { output: responseOutput, error, imageUrl: responseImageUrl } = response.data;
//         if (error) {
//           setOutput(error);
//           setIsError(true);
//         } else {
//           setOutput(responseOutput || 'No output');
//           setIsError(false);
//         }
//         setImageUrl(responseImageUrl ? `https://compiler-backend-e3eg.onrender.com${responseImageUrl}` : '');
//       } else {
//         setOutput(response.data || 'No output');
//         setIsError(false);
//       }
//       setIsExecutingCode(false);
//     } catch (error) {
//       console.error('Run error:', error.message, error.response?.data);
//       const errorMessage = error.response?.data?.error || error.message || 'Failed to execute code. Please check the backend server.';
//       setOutput(errorMessage);
//       setIsError(true);
//       setIsExecutingCode(false);
//     }
//   };

//   const handleSave = async () => {
//     setIsSaving(true);
//     setIsSaved(false);
//     setIsGeneratingLink(true);

//     try {
//       const response = await axios.post('https://compiler-backend-e3eg.onrender.com/api/code/save', { code, language: currentLanguage }, {
//         headers: { 'Content-Type': 'application/json' },
//         timeout: 15000,
//       });
//       const { token } = response.data;
//       setLinkId(token);
//       const frontendBaseUrl = window.location.origin;
//       setShareLink(`${frontendBaseUrl}/code?token=${token}`);
//       setIsSaved(true);
//       setIsGeneratingLink(false);
//       setTimeout(() => setIsSaved(false), 2000);
//     } catch (error) {
//       console.error('Save error:', error.message, error.response?.data);
//       alert('Failed to save code. Please try again. Error: ' + (error.response?.data?.error || error.message));
//       setIsSaving(false);
//       setIsSaved(false);
//       setIsGeneratingLink(false);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDownloadCode = () => {
//     const fileExtension = {
//       python: 'py',
//       javascript: 'js',
//       cpp: 'cpp',
//       c: 'c',
//       java: 'java',
//     }[currentLanguage];

//     const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
//     saveAs(blob, `code.${fileExtension}`);
//   };

//   const handleDownloadImage = () => {
//     if (imageUrl) {
//       saveAs(imageUrl, imageUrl.split('/').pop());
//     }
//   };

//   const handleShare = () => {
//     if (!shareLink) {
//       alert('Please save your code before sharing!');
//       return;
//     }
//     setShowShareLink(true);
//   };

//   const handleCopyToClipboard = () => {
//     if (shareLink) {
//       navigator.clipboard.writeText(shareLink);
//       alert('Link copied to clipboard!');
//       setTimeout(() => setShowShareLink(false), 500);
//     }
//   };

//   const hideOutput = () => {
//     setShowOutput(false);
//     setImageUrl('');
//   };

//   const openImageModal = () => {
//     if (imageUrl) {
//       setShowImageModal(true);
//     }
//   };

//   const toggleOutput = () => {
//     setShowOutput(!showOutput);
//   };

//   const toggleModeDropdown = () => {
//     setShowModeDropdown(!showModeDropdown);
//   };

//   const handleModeSelect = (modeValue) => {
//     setMode(modeValue);
//     setShowModeDropdown(false);
//   };

//   if (showLoadingScreen) {
//     return <LoadingScreen />;
//   }

//   if (isLoadingInitialCode) {
//     return (
//       <div className="full-screen-message">
//         <h2>Loading code...</h2>
//       </div>
//     );
//   }

//   if (fetchError) {
//     return (
//       <div className="full-screen-message error-message">
//         <h2>Error: {fetchError}</h2>
//         <button onClick={() => navigate('/')}>Go Back</button>
//       </div>
//     );
//   }

//   if (!currentLanguage || !templates[currentLanguage]) {
//     return (
//       <div className="full-screen-message error-message">
//         <h2>Error: Invalid language selected or failed to determine language.</h2>
//         <button onClick={() => navigate('/')}>Go Back</button>
//       </div>
//     );
//   }

//   return (
//     <motion.div className="editor-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
//       <nav className={`navbar ${mode}`}>
//         <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>KODE SMITH</h1>
//       </nav>
//       <div className={`action-bar ${mode}`}>
//         <button onClick={handleRun} className={`action-btn ${mode}`}>
//           <i className="fa-solid fa-play"></i> Run (Ctrl+Enter)
//         </button>
//         <div className="mode-toggle-container">
//           <button onClick={toggleModeDropdown} className={`mode-toggle ${mode}`}>
//             <i className="fa-solid fa-palette"></i> Theme
//           </button>
//           {showModeDropdown && (
//             <motion.div
//               className={`mode-dropdown ${mode}`}
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.3 }}
//             >
//               {themes.map((theme) => (
//                 <div key={theme.value} className={`mode-dropdown-item ${mode}`} onClick={() => handleModeSelect(theme.value)}>
//                   {theme.name}
//                 </div>
//               ))}
//             </motion.div>
//           )}
//         </div>
//         <button onClick={handleSave} className={`action-btn ${mode}`}>
//           <i className="fa-solid fa-save"></i> Save
//         </button>
//         <button onClick={handleDownloadCode} className={`action-btn ${mode}`}>
//           <i className="fa-solid fa-download"></i> Download
//         </button>
//         <div className="share-container">
//           <button onClick={handleShare} className={`action-btn ${mode}`}>
//             <i className="fa-solid fa-share-alt"></i> Share
//           </button>
//           {showShareLink && (
//             <motion.div
//               className={`share-link ${mode}`}
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.8 }}
//               transition={{ duration: 0.3 }}
//             >
//               <p>
//                 <span>{shareLink}</span>
//                 <i className="fa-solid fa-copy copy-icon" onClick={handleCopyToClipboard} style={{ cursor: 'pointer', marginLeft: '10px' }}></i>
//               </p>
//             </motion.div>
//           )}
//         </div>
//       </div>
//       <div className="editor-container">
//         <div className={`editor-section ${mode}`}>
//           <div className="editor-wrapper" ref={editorWrapperRef}>
//             <div className={`line-numbers ${mode}`} ref={lineNumbersRef}>
//               {lineNumbers.map((number) => (
//                 <div key={number} className={`line-number ${number === currentLine ? 'current-line' : ''}`}>
//                   {number}
//                 </div>
//               ))}
//             </div>
//             <div className="code-editor-wrapper">
//               <div className={`current-line-highlight ${mode}`} ref={highlightRef} style={{ top: `${(currentLine - 1) * 24 + 20}px`, height: '24px' }} />
//               <textarea
//                 id="code-editor"
//                 className={`code-editor ${mode}`}
//                 ref={textareaRef}
//                 value={code}
//                 onChange={handleCodeChange}
//                 onKeyDown={handleKeyDown}
//                 onClick={hideOutput}
//                 spellCheck="false"
//               />
//             </div>
//           </div>
//           {suggestions.length > 0 && (
//             <div
//               className={`recommendation-container ${mode}`}
//               style={{ top: suggestionPosition.top, left: suggestionPosition.left }}
//               ref={suggestionRef}
//             >
//               {suggestions.map((suggestion, index) => (
//                 <div
//                   key={index}
//                   className={`recommendation-item ${index === selectedSuggestionIndex ? 'selected' : ''} ${mode}`}
//                   onClick={() => insertSuggestion(suggestion)}
//                 >
//                   <span className={`recommendation-value ${suggestion.meta}`}>{suggestion.value}</span>
//                   <span className={`recommendation-meta ${mode}`}>{suggestion.meta}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       {isSaving && (
//         <motion.div className={`notification ${mode}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
//           Code is saving...
//         </motion.div>
//       )}
//       {isSaved && (
//         <motion.div className={`notification ${mode}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
//           Code saved!
//         </motion.div>
//       )}
//       {isGeneratingLink && (
//         <motion.div className={`notification ${mode}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
//           Generating link...
//         </motion.div>
//       )}
//       {hasOutput && (
//         <motion.div
//           className={`output-section ${isError ? 'error' : 'success'} ${showOutput ? 'show' : ''} ${mode}`}
//           initial={{ transform: 'translateY(100%)' }}
//           animate={{ transform: showOutput ? 'translateY(0)' : 'translateY(100%)' }}
//           transition={{ duration: 0.3 }}
//         >
//           <h3>Output:</h3>
//           {isExecutingCode ? (
//             <div className="loading-spinner">Loading...</div>
//           ) : (
//             <div className="output-content">
//               <pre>{output}</pre>
//               {imageUrl && (
//                 <div className="output-image">
//                   <img src={imageUrl} alt="Output Image" onClick={openImageModal} style={{ cursor: 'pointer' }} />
//                 </div>
//               )}
//             </div>
//           )}
//         </motion.div>
//       )}
//       {hasOutput && (
//         <motion.button
//           className={`toggle-output-btn ${mode}`}
//           onClick={toggleOutput}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           <i className={`fa-solid ${showOutput ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
//         </motion.button>
//       )}
//       {showImageModal && (
//         <motion.div
//           className="image-modal"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           <div className={`image-modal-content ${mode}`} ref={modalRef}>
//             <img src={imageUrl} alt="Full Screen Output Image" />
//             <div className="image-modal-actions">
//               <button onClick={handleDownloadImage} className={`action-btn ${mode}`}>
//                 <i className="fa-solid fa-download"></i> Download Image
//               </button>
//               <button onClick={() => setShowImageModal(false)} className={`action-btn ${mode}`}>
//                 <i className="fa-solid fa-times"></i> Close
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// };

// // Main App Component
// const App = () => {
//   const [showSplash, setShowSplash] = useState(true);
//   const [mode, setMode] = useState('dark');

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowSplash(false);
//     }, 3000);
//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <Router>
//       <div className={`app ${mode}`}>
//         <AnimatePresence>
//           {showSplash ? (
//             <SplashScreen key="splash" />
//           ) : (
//             <Routes>
//               <Route path="/" element={<MainScreen mode={mode} />} />
//               <Route
//                 path="/editor/:language"
//                 element={
//                   <ErrorBoundary>
//                     <EditorScreen mode={mode} setMode={setMode} />
//                   </ErrorBoundary>
//                 }
//               />
//               <Route
//                 path="/code"
//                 element={
//                   <ErrorBoundary>
//                     <EditorScreen mode={mode} setMode={setMode} />
//                   </ErrorBoundary>
//                 }
//               />
//               <Route path="*" element={<div className="not-found-page"><h2>404: Page Not Found</h2><button onClick={() => window.location.href = '/'}>Go Home</button></div>} />
//             </Routes>
//           )}
//         </AnimatePresence>
//       </div>
//     </Router>
//   );
// };

// export default App;

import { useState, useEffect, Component, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Move templates outside the component to avoid initialization issues
const templates = {
  python: `# Welcome to Kode Smith! 🎉\n#\n# Python: The language of simplicity and power, perfect for AI, data science, and automation.\n#\n# Code with clarity, create with ease—Python is your gateway to endless possibilities.\n#\n\nprint("Hello Duniya")`,
  javascript: `// Welcome to Kode Smith! 🎉\n// \n// JavaScript: Bring the web to life with dynamic, interactive experiences.\n// \n// From front-end flair to back-end brilliance—JavaScript powers it all.\n// \n\nconsole.log("Hello, World!");`,
  cpp: `/*\n * Welcome to Kode Smith! 🎉\n *\n * C++: The language of speed and control, ideal for games, systems, and performance-driven apps.\n *\n * Harness the power of C++—where precision meets performance.\n *\n * Happy Coding! 🚀\n */\n#include <iostream>\nint main() {\n    std::cout << "Hello, World!\\n";\n    return 0;\n}`,
  c: `/*\n * Welcome to Kode Smith! 🎉\n *\n * C: The foundation of modern programming, built for speed and low-level control.\n *\n * Code close to the metal—unleash the raw power of C.\n *\n * Happy Coding! 🚀\n */\n#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  java: `\npublic class KodeSmith {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`
};

// Error Boundary to catch rendering errors in EditorScreen
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong in EditorScreen:</h2>
          <pre>{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.href = '/'}>Go Back to Home</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading Screen Component for shared links
const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h1>Loading Code</h1>
      </div>
    </div>
  );
};

// SplashScreen Component
const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src="/logo3.png" alt="Kode Smith Logo" className="splash-logo" />
        <h1 className="fade-text">KODE SMITH</h1>
      </div>
    </div>
  );
};

// MainScreen Component
const MainScreen = ({ mode }) => {
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
      <h1>Compiler is ready ⚙️ choose your command language!</h1>
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

// EditorScreen Component
const EditorScreen = ({ mode, setMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language: paramLanguage } = useParams();
  const textareaRef = useRef(null);
  const suggestionRef = useRef(null);
  const editorWrapperRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const highlightRef = useRef(null);
  const modalRef = useRef(null);
  
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const [code, setCode] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(paramLanguage);
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [linkId, setLinkId] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const [isLoadingInitialCode, setIsLoadingInitialCode] = useState(true);
  const [isExecutingCode, setIsExecutingCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [currentLine, setCurrentLine] = useState(1);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [imageUrl, setImageUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [fetchError, setFetchError] = useState(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(!!token);

  // Symbol pairs for auto-closing
  const symbolPairs = {
    '(': ')',
    '{': '}',
    '[': ']',
    '<': '>',
    '"': '"',
    "'": "'",
    '`': '`'
  };

  // Effect to handle loading screen for shared links
  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        setShowLoadingScreen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [token]);

  // Effect to load code based on token or paramLanguage
  useEffect(() => {
    const loadCode = async () => {
      setIsLoadingInitialCode(true);
      setFetchError(null);

      if (token) {
        try {
          const response = await axios.get(`https://compiler-backend-e3eg.onrender.com/api/code/${token}`, {
            timeout: 30000,
          });
          const { code: sharedCode, language: sharedLanguage } = response.data;
          if (sharedCode && sharedLanguage) {
            setCode(sharedCode);
            setCurrentLanguage(sharedLanguage);
            setLinkId(token);
            setShareLink(`${window.location.origin}/code?token=${token}`);
          } else {
            setFetchError('Invalid shared code data.');
            setCode(templates[paramLanguage] || '');
            setCurrentLanguage(paramLanguage);
          }
        } catch (error) {
          console.error('Failed to load shared code:', error.message, error.response?.data);
          setFetchError('Failed to load shared code. Error: ' + (error.response?.data?.error || error.message));
          setCode(templates[paramLanguage] || '');
          setCurrentLanguage(paramLanguage);
        } finally {
          setIsLoadingInitialCode(false);
        }
      } else {
        if (paramLanguage && templates[paramLanguage]) {
          setCode(templates[paramLanguage]);
          setCurrentLanguage(paramLanguage);
          setIsLoadingInitialCode(false);
        } else {
          setFetchError('No language specified or invalid language.');
          setIsLoadingInitialCode(false);
        }
      }
    };

    loadCode();
  }, [token, paramLanguage]);

  const lineNumbers = code.split('\n').map((_, index) => index + 1);

  const languageKeywords = {
    python: [
      { caption: 'def', value: 'def', meta: 'token-keyword' },
      { caption: 'return', value: 'return', meta: 'token-keyword' },
      { caption: 'if', value: 'if', meta: 'token-keyword' },
      { caption: 'else', value: 'else', meta: 'token-keyword' },
      { caption: 'elif', value: 'elif', meta: 'token-keyword' },
      { caption: 'for', value: 'for', meta: 'token-keyword' },
      { caption: 'while', value: 'while', meta: 'token-keyword' },
      { caption: 'break', value: 'break', meta: 'token-keyword' },
      { caption: 'continue', value: 'continue', meta: 'token-keyword' },
      { caption: 'import', value: 'import', meta: 'token-keyword' },
      { caption: 'from', value: 'from', meta: 'token-keyword' },
      { caption: 'as', value: 'as', meta: 'token-keyword' },
      { caption: 'try', value: 'try', meta: 'token-keyword' },
      { caption: 'except', value: 'except', meta: 'token-keyword' },
      { caption: 'finally', value: 'finally', meta: 'token-keyword' },
      { caption: 'with', value: 'with', meta: 'token-keyword' },
      { caption: 'pass', value: 'pass', meta: 'token-keyword' },
      { caption: 'raise', value: 'raise', meta: 'token-keyword' },
      { caption: 'lambda', value: 'lambda', meta: 'token-keyword' },
      { caption: 'yield', value: 'yield', meta: 'token-keyword' },
      { caption: 'global', value: 'global', meta: 'token-keyword' },
      { caption: 'nonlocal', value: 'nonlocal', meta: 'token-keyword' },
      { caption: 'True', value: 'True', meta: 'token-constant' },
      { caption: 'False', value: 'False', meta: 'token-constant' },
      { caption: 'None', value: 'None', meta: 'token-constant' },
      { caption: 'and', value: 'and', meta: 'token-operator' },
      { caption: 'or', value: 'or', meta: 'token-operator' },
      { caption: 'not', value: 'not', meta: 'token-operator' },
      { caption: 'is', value: 'is', meta: 'token-operator' },
      { caption: 'in', value: 'in', meta: 'token-operator' },
      { caption: 'class', value: 'class', meta: 'token-keyword' },
      { caption: 'self', value: 'self', meta: 'token-keyword' },
      { caption: 'print', value: 'print', meta: 'token-function' },
      { caption: 'input', value: 'input', meta: 'token-function' },
      { caption: 'len', value: 'len', meta: 'token-function' },
      { caption: 'range', value: 'range', meta: 'token-function' },
      { caption: 'open', value: 'open', meta: 'token-function' },
      { caption: 'read', value: 'read', meta: 'token-function' },
      { caption: 'write', value: 'write', meta: 'token-function' },
      { caption: 'append', value: 'append', meta: 'token-function' },
      { caption: 'dict', value: 'dict', meta: 'token-type' },
      { caption: 'list', value: 'list', meta: 'token-type' },
      { caption: 'tuple', value: 'tuple', meta: 'token-type' },
      { caption: 'set', value: 'set', meta: 'token-type' },
      { caption: 'int', value: 'int', meta: 'token-type' },
      { caption: 'float', value: 'float', meta: 'token-type' },
      { caption: 'str', value: 'str', meta: 'token-type' },
      { caption: 'bool', value: 'bool', meta: 'token-type' },
      { caption: 'zip', value: 'zip', meta: 'token-function' },
      { caption: 'enumerate', value: 'enumerate', meta: 'token-function' },
    ],
    javascript: [
      { caption: 'let', value: 'let', meta: 'token-keyword' },
      { caption: 'const', value: 'const', meta: 'token-keyword' },
      { caption: 'var', value: 'var', meta: 'token-keyword' },
      { caption: 'function', value: 'function', meta: 'token-keyword' },
      { caption: 'return', value: 'return', meta: 'token-keyword' },
      { caption: 'if', value: 'if', meta: 'token-keyword' },
      { caption: 'else', value: 'else', meta: 'token-keyword' },
      { caption: 'switch', value: 'switch', meta: 'token-keyword' },
      { caption: 'case', value: 'case', meta: 'token-keyword' },
      { caption: 'break', value: 'break', meta: 'token-keyword' },
      { caption: 'continue', value: 'continue', meta: 'token-keyword' },
      { caption: 'for', value: 'for', meta: 'token-keyword' },
      { caption: 'while', value: 'while', meta: 'token-keyword' },
      { caption: 'do', value: 'do', meta: 'token-keyword' },
      { caption: 'try', value: 'try', meta: 'token-keyword' },
      { caption: 'catch', value: 'catch', meta: 'token-keyword' },
      { caption: 'throw', value: 'throw', meta: 'token-keyword' },
      { caption: 'finally', value: 'finally', meta: 'token-keyword' },
      { caption: 'import', value: 'import', meta: 'token-keyword' },
      { caption: 'export', value: 'export', meta: 'token-keyword' },
      { caption: 'from', value: 'from', meta: 'token-keyword' },
      { caption: 'as', value: 'as', meta: 'token-keyword' },
      { caption: 'new', value: 'new', meta: 'token-operator' },
      { caption: 'class', value: 'class', meta: 'token-keyword' },
      { caption: 'extends', value: 'extends', meta: 'token-keyword' },
      { caption: 'super', value: 'super', meta: 'token-keyword' },
      { caption: 'this', value: 'this', meta: 'token-keyword' },
      { caption: 'constructor', value: 'constructor', meta: 'token-keyword' },
      { caption: 'null', value: 'null', meta: 'token-constant' },
      { caption: 'undefined', value: 'undefined', meta: 'token-constant' },
      { caption: 'true', value: 'true', meta: 'token-constant' },
      { caption: 'false', value: 'false', meta: 'token-constant' },
      { caption: 'console.log', value: 'console.log', meta: 'token-function' },
      { caption: 'typeof', value: 'typeof', meta: 'token-operator' },
      { caption: 'instanceof', value: 'instanceof', meta: 'token-operator' },
      { caption: 'await', value: 'await', meta: 'token-keyword' },
      { caption: 'async', value: 'async', meta: 'token-keyword' },
      { caption: 'Promise', value: 'Promise', meta: 'token-type' },
      { caption: 'setTimeout', value: 'setTimeout', meta: 'token-function' },
      { caption: 'setInterval', value: 'setInterval', meta: 'token-function' },
      { caption: 'Math', value: 'Math', meta: 'token-object' },
      { caption: 'JSON', value: 'JSON', meta: 'token-object' },
      { caption: 'fetch', value: 'fetch', meta: 'token-function' },
      { caption: 'map', value: 'map', meta: 'token-function' },
      { caption: 'filter', value: 'filter', meta: 'token-function' },
      { caption: 'reduce', value: 'reduce', meta: 'token-function' },
      { caption: 'document', value: 'document', meta: 'token-object' },
      { caption: 'window', value: 'window', meta: 'token-object' },
    ],
    cpp: [
      { caption: 'int', value: 'int', meta: 'token-type' },
      { caption: 'float', value: 'float', meta: 'token-type' },
      { caption: 'double', value: 'double', meta: 'token-type' },
      { caption: 'char', value: 'char', meta: 'token-type' },
      { caption: 'void', value: 'void', meta: 'token-type' },
      { caption: 'bool', value: 'bool', meta: 'token-type' },
      { caption: 'auto', value: 'auto', meta: 'token-keyword' },
      { caption: 'const', value: 'const', meta: 'token-keyword' },
      { caption: 'static', value: 'static', meta: 'token-keyword' },
      { caption: 'extern', value: 'extern', meta: 'token-keyword' },
      { caption: 'mutable', value: 'mutable', meta: 'token-keyword' },
      { caption: 'volatile', value: 'volatile', meta: 'token-keyword' },
      { caption: 'return', value: 'return', meta: 'token-keyword' },
      { caption: 'if', value: 'if', meta: 'token-keyword' },
      { caption: 'else', value: 'else', meta: 'token-keyword' },
      { caption: 'switch', value: 'switch', meta: 'token-keyword' },
      { caption: 'case', value: 'case', meta: 'token-keyword' },
      { caption: 'default', value: 'default', meta: 'token-keyword' },
      { caption: 'break', value: 'break', meta: 'token-keyword' },
      { caption: 'continue', value: 'continue', meta: 'token-keyword' },
      { caption: 'while', value: 'while', meta: 'token-keyword' },
      { caption: 'do', value: 'do', meta: 'token-keyword' },
      { caption: 'for', value: 'for', meta: 'token-keyword' },
      { caption: 'new', value: 'new', meta: 'token-operator' },
      { caption: 'delete', value: 'delete', meta: 'token-operator' },
      { caption: 'try', value: 'try', meta: 'token-keyword' },
      { caption: 'catch', value: 'catch', meta: 'token-keyword' },
      { caption: 'throw', value: 'throw', meta: 'token-keyword' },
      { caption: 'noexcept', value: 'noexcept', meta: 'token-keyword' },
      { caption: 'inline', value: 'inline', meta: 'token-keyword' },
      { caption: 'namespace', value: 'namespace', meta: 'token-keyword' },
      { caption: 'using', value: 'using', meta: 'token-keyword' },
      { caption: 'std', value: 'std', meta: 'token-namespace' },
      { caption: 'class', value: 'class', meta: 'token-keyword' },
      { caption: 'struct', value: 'struct', meta: 'token-keyword' },
      { caption: 'public', value: 'public', meta: 'token-keyword' },
      { caption: 'private', value: 'private', meta: 'token-keyword' },
      { caption: 'protected', value: 'protected', meta: 'token-keyword' },
      { caption: 'friend', value: 'friend', meta: 'token-keyword' },
      { caption: 'virtual', value: 'virtual', meta: 'token-keyword' },
      { caption: 'override', value: 'override', meta: 'token-keyword' },
      { caption: 'template', value: 'template', meta: 'token-keyword' },
      { caption: 'typename', value: 'typename', meta: 'token-keyword' },
      { caption: 'operator', value: 'operator', meta: 'token-operator' },
      { caption: 'this', value: 'this', meta: 'token-keyword' },
      { caption: 'nullptr', value: 'nullptr', meta: 'token-constant' },
      { caption: 'cout', value: 'cout', meta: 'token-object' },
      { caption: 'cin', value: 'cin', meta: 'token-object' },
      { caption: 'endl', value: 'endl', meta: 'token-object' },
      { caption: '#include', value: '#include', meta: 'token-keyword' },
      { caption: 'vector', value: 'vector', meta: 'token-type' },
      { caption: 'map', value: 'map', meta: 'token-type' },
    ],
    c: [
      { caption: 'int', value: 'int', meta: 'token-type' },
      { caption: 'float', value: 'float', meta: 'token-type' },
      { caption: 'double', value: 'double', meta: 'token-type' },
      { caption: 'char', value: 'char', meta: 'token-type' },
      { caption: 'void', value: 'void', meta: 'token-type' },
      { caption: 'short', value: 'short', meta: 'token-type' },
      { caption: 'long', value: 'long', meta: 'token-type' },
      { caption: 'signed', value: 'signed', meta: 'token-type' },
      { caption: 'unsigned', value: 'unsigned', meta: 'token-type' },
      { caption: 'const', value: 'const', meta: 'token-keyword' },
      { caption: 'static', value: 'static', meta: 'token-keyword' },
      { caption: 'extern', value: 'extern', meta: 'token-keyword' },
      { caption: 'volatile', value: 'volatile', meta: 'token-keyword' },
      { caption: 'auto', value: 'auto', meta: 'token-keyword' },
      { caption: 'register', value: 'register', meta: 'token-keyword' },
      { caption: 'return', value: 'return', meta: 'token-keyword' },
      { caption: 'if', value: 'if', meta: 'token-keyword' },
      { caption: 'else', value: 'else', meta: 'token-keyword' },
      { caption: 'switch', value: 'switch', meta: 'token-keyword' },
      { caption: 'case', value: 'case', meta: 'token-keyword' },
      { caption: 'default', value: 'default', meta: 'token-keyword' },
      { caption: 'break', value: 'break', meta: 'token-keyword' },
      { caption: 'continue', value: 'continue', meta: 'token-keyword' },
      { caption: 'while', value: 'while', meta: 'token-keyword' },
      { caption: 'do', value: 'do', meta: 'token-keyword' },
      { caption: 'for', value: 'for', meta: 'token-keyword' },
      { caption: 'goto', value: 'goto', meta: 'token-keyword' },
      { caption: 'sizeof', value: 'sizeof', meta: 'token-operator' },
      { caption: 'typedef', value: 'typedef', meta: 'token-keyword' },
      { caption: 'struct', value: 'struct', meta: 'token-keyword' },
      { caption: 'union', value: 'union', meta: 'token-keyword' },
      { caption: 'enum', value: 'enum', meta: 'token-keyword' },
      { caption: '#include', value: '#include', meta: 'token-keyword' },
      { caption: '#define', value: '#define', meta: 'token-keyword' },
      { caption: '#if', value: '#if', meta: 'token-keyword' },
      { caption: '#endif', value: '#endif', meta: 'token-keyword' },
      { caption: '#else', value: '#else', meta: 'token-keyword' },
      { caption: '#elif', value: '#elif', meta: 'token-keyword' },
      { caption: 'printf', value: 'printf', meta: 'token-function' },
      { caption: 'scanf', value: 'scanf', meta: 'token-function' },
      { caption: 'main', value: 'main', meta: 'token-function' },
      { caption: 'NULL', value: 'NULL', meta: 'token-constant' },
      { caption: 'stdin', value: 'stdin', meta: 'token-object' },
      { caption: 'stdout', value: 'stdout', meta: 'token-object' },
      { caption: 'stderr', value: 'stderr', meta: 'token-object' },
      { caption: 'fopen', value: 'fopen', meta: 'token-function' },
      { caption: 'fclose', value: 'fclose', meta: 'token-function' },
      { caption: 'malloc', value: 'malloc', meta: 'token-function' },
      { caption: 'free', value: 'free', meta: 'token-function' },
      { caption: 'memcpy', value: 'memcpy', meta: 'token-function' },
      { caption: 'memset', value: 'memset', meta: 'token-function' },
      { caption: 'exit', value: 'exit', meta: 'token-function' },
    ],
    java: [
      { caption: 'int', value: 'int', meta: 'token-type' },
      { caption: 'float', value: 'float', meta: 'token-type' },
      { caption: 'double', value: 'double', meta: 'token-type' },
      { caption: 'char', value: 'char', meta: 'token-type' },
      { caption: 'boolean', value: 'boolean', meta: 'token-type' },
      { caption: 'void', value: 'void', meta: 'token-type' },
      { caption: 'static', value: 'static', meta: 'token-keyword' },
      { caption: 'final', value: 'final', meta: 'token-keyword' },
      { caption: 'public', value: 'public', meta: 'token-keyword' },
      { caption: 'private', value: 'private', meta: 'token-keyword' },
      { caption: 'protected', value: 'protected', meta: 'token-keyword' },
      { caption: 'class', value: 'class', meta: 'token-keyword' },
      { caption: 'interface', value: 'interface', meta: 'token-keyword' },
      { caption: 'extends', value: 'extends', meta: 'token-keyword' },
      { caption: 'implements', value: 'implements', meta: 'token-keyword' },
      { caption: 'abstract', value: 'abstract', meta: 'token-keyword' },
      { caption: 'return', value: 'return', meta: 'token-keyword' },
      { caption: 'if', value: 'if', meta: 'token-keyword' },
      { caption: 'else', value: 'else', meta: 'token-keyword' },
      { caption: 'switch', value: 'switch', meta: 'token-keyword' },
      { caption: 'case', value: 'case', meta: 'token-keyword' },
      { caption: 'default', value: 'default', meta: 'token-keyword' },
      { caption: 'break', value: 'break', meta: 'token-keyword' },
      { caption: 'continue', value: 'continue', meta: 'token-keyword' },
      { caption: 'while', value: 'while', meta: 'token-keyword' },
      { caption: 'do', value: 'do', meta: 'token-keyword' },
      { caption: 'for', value: 'for', meta: 'token-keyword' },
      { caption: 'try', value: 'try', meta: 'token-keyword' },
      { caption: 'catch', value: 'catch', meta: 'token-keyword' },
      { caption: 'throw', value: 'throw', meta: 'token-keyword' },
      { caption: 'throws', value: 'throws', meta: 'token-keyword' },
      { caption: 'import', value: 'import', meta: 'token-keyword' },
      { caption: 'package', value: 'package', meta: 'token-keyword' },
      { caption: 'super', value: 'super', meta: 'token-keyword' },
      { caption: 'this', value: 'this', meta: 'token-keyword' },
      { caption: 'new', value: 'new', meta: 'token-operator' },
      { caption: 'null', value: 'null', meta: 'token-constant' },
      { caption: 'true', value: 'true', meta: 'token-constant' },
      { caption: 'false', value: 'false', meta: 'token-constant' },
      { caption: 'synchronized', value: 'synchronized', meta: 'token-keyword' },
      { caption: 'System.out.println', value: 'System.out.println', meta: 'token-function' },
      { caption: 'Scanner', value: 'Scanner', meta: 'token-type' },
      { caption: 'ArrayList', value: 'ArrayList', meta: 'token-type' },
      { caption: 'HashMap', value: 'HashMap', meta: 'token-type' },
      { caption: 'instanceof', value: 'instanceof', meta: 'token-operator' },
      { caption: 'enum', value: 'enum', meta: 'token-keyword' },
      { caption: 'static import', value: 'static import', meta: 'token-keyword' },
    ],
  };

  const themes = [
    { name: 'Light Mode', value: 'light' },
    { name: 'Dark Mode', value: 'dark' },
    { name: 'Dracula Mode', value: 'dracula' },
    { name: 'Tokyo Night Mode', value: 'tokyo-night' },
    { name: 'Nord Mode', value: 'nord' },
    { name: 'Custom Neon Mode', value: 'custom-neon' },
  ];

  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbersElem = lineNumbersRef.current;
    const highlight = highlightRef.current;

    const handleScroll = () => {
      if (textarea && lineNumbersElem && highlight) {
        lineNumbersElem.scrollTop = textarea.scrollTop;
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
  }, [currentLine, code]);

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

    const keywords = languageKeywords[currentLanguage] || [];
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
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const cursorEnd = textarea.selectionEnd;
    const textBeforeCursor = code.substring(0, cursorPosition);
    const textAfterCursor = code.substring(cursorEnd);

    // Handle Ctrl+Enter for running code
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }

    // Handle suggestions navigation
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

    // Handle auto-pairing for opening symbols
    if (Object.keys(symbolPairs).includes(e.key)) {
      e.preventDefault();
      const closingSymbol = symbolPairs[e.key];
      const newCode = textBeforeCursor + e.key + closingSymbol + textAfterCursor;
      setCode(newCode);

      // Move cursor between the pair
      setTimeout(() => {
        textarea.selectionStart = cursorPosition + 1;
        textarea.selectionEnd = cursorPosition + 1;
      }, 0);
    }

    // Handle typing closing symbols (skip if matching pair exists)
    if (Object.values(symbolPairs).includes(e.key)) {
      const nextChar = code[cursorPosition];
      if (nextChar === e.key) {
        e.preventDefault();
        textarea.selectionStart = cursorPosition + 1;
        textarea.selectionEnd = cursorPosition + 1;
      }
    }

    // Handle backspace to remove both symbols if cursor is between a pair
    if (e.key === 'Backspace' && cursorPosition > 0) {
      const prevChar = code[cursorPosition - 1];
      const nextChar = code[cursorPosition];
      if (
        (prevChar === '(' && nextChar === ')') ||
        (prevChar === '{' && nextChar === '}') ||
        (prevChar === '[' && nextChar === ']') ||
        (prevChar === '<' && nextChar === '>') ||
        (prevChar === '"' && nextChar === '"') ||
        (prevChar === "'" && nextChar === "'") ||
        (prevChar === '`' && nextChar === '`')
      ) {
        e.preventDefault();
        const newCode = code.substring(0, cursorPosition - 1) + code.substring(cursorPosition + 1);
        setCode(newCode);
        setTimeout(() => {
          textarea.selectionStart = cursorPosition - 1;
          textarea.selectionEnd = cursorPosition - 1;
        }, 0);
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
    setIsExecutingCode(true);
    setOutput('');
    setImageUrl('');
    setHasOutput(true);

    try {
      const response = await axios.post('https://compiler-backend-e3eg.onrender.com/api/code/execute', { code, language: currentLanguage }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
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
      setIsExecutingCode(false);
    } catch (error) {
      console.error('Run error:', error.message, error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to execute code. Please check the backend server.';
      setOutput(errorMessage);
      setIsError(true);
      setIsExecutingCode(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);
    setIsGeneratingLink(true);

    try {
      const response = await axios.post('https://compiler-backend-e3eg.onrender.com/api/code/save', { code, language: currentLanguage }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      const { token } = response.data;
      setLinkId(token);
      const frontendBaseUrl = window.location.origin;
      setShareLink(`${frontendBaseUrl}/code?token=${token}`);
      setIsSaved(true);
      setIsGeneratingLink(false);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Save error:', error.message, error.response?.data);
      alert('Failed to save code. Please try again. Error: ' + (error.response?.data?.error || error.message));
      setIsSaving(false);
      setIsSaved(false);
      setIsGeneratingLink(false);
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
    }[currentLanguage];

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `code.${fileExtension}`);
  };

  const handleDownloadImage = () => {
    if (imageUrl) {
      saveAs(imageUrl, imageUrl.split('/').pop());
    }
  };

  const handleShare = () => {
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

  if (showLoadingScreen) {
    return <LoadingScreen />;
  }

  if (isLoadingInitialCode) {
    return (
      <div className="full-screen-message">
        <h2>Loading code...</h2>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="full-screen-message error-message">
        <h2>Error: {fetchError}</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  if (!currentLanguage || !templates[currentLanguage]) {
    return (
      <div className="full-screen-message error-message">
        <h2>Error: Invalid language selected or failed to determine language.</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  return (
    <motion.div className="editor-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <nav className={`navbar ${mode}`}>
        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>KODE SMITH</h1>
      </nav>
      <div className={`action-bar ${mode}`}>
        <button onClick={handleRun} className={`action-btn ${mode}`}>
          <i className="fa-solid fa-play"></i> Run (Ctrl+Enter)
        </button>
        <div className="mode-toggle-container">
          <button onClick={toggleModeDropdown} className={`mode-toggle ${mode}`}>
            <i className="fa-solid fa-palette"></i> Theme
          </button>
          {showModeDropdown && (
            <motion.div
              className={`mode-dropdown ${mode}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {themes.map((theme) => (
                <div key={theme.value} className={`mode-dropdown-item ${mode}`} onClick={() => handleModeSelect(theme.value)}>
                  {theme.name}
                </div>
              ))}
            </motion.div>
          )}
        </div>
        <button onClick={handleSave} className={`action-btn ${mode}`}>
          <i className="fa-solid fa-save"></i> Save
        </button>
        <button onClick={handleDownloadCode} className={`action-btn ${mode}`}>
          <i className="fa-solid fa-download"></i> Download
        </button>
        <div className="share-container">
          <button onClick={handleShare} className={`action-btn ${mode}`}>
            <i className="fa-solid fa-share-alt"></i> Share
          </button>
          {showShareLink && (
            <motion.div
              className={`share-link ${mode}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
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
              <div className={`current-line-highlight ${mode}`} ref={highlightRef} style={{ top: `${(currentLine - 1) * 24 + 20}px`, height: '24px' }} />
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
                  className={`recommendation-item ${index === selectedSuggestionIndex ? 'selected' : ''} ${mode}`}
                  onClick={() => insertSuggestion(suggestion)}
                >
                  <span className={`recommendation-value ${suggestion.meta}`}>{suggestion.value}</span>
                  <span className={`recommendation-meta ${mode}`}>{suggestion.meta}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isSaving && (
        <motion.div className={`notification ${mode}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          Code is saving...
        </motion.div>
      )}
      {isSaved && (
        <motion.div className={`notification ${mode}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          Code saved!
        </motion.div>
      )}
      {isGeneratingLink && (
        <motion.div className={`notification ${mode}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          Generating link...
        </motion.div>
      )}
      {hasOutput && (
        <motion.div
          className={`output-section ${isError ? 'error' : 'success'} ${showOutput ? 'show' : ''} ${mode}`}
          initial={{ transform: 'translateY(100%)' }}
          animate={{ transform: showOutput ? 'translateY(0)' : 'translateY(100%)' }}
          transition={{ duration: 0.3 }}
        >
          <h3>Output:</h3>
          {isExecutingCode ? (
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
              <button onClick={handleDownloadImage} className={`action-btn ${mode}`}>
                <i className="fa-solid fa-download"></i> Download Image
              </button>
              <button onClick={() => setShowImageModal(false)} className={`action-btn ${mode}`}>
                <i className="fa-solid fa-times"></i> Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Main App Component
const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState('dark');

  useEffect(() => {
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
                path="/code"
                element={
                  <ErrorBoundary>
                    <EditorScreen mode={mode} setMode={setMode} />
                  </ErrorBoundary>
                }
              />
              <Route path="*" element={<div className="not-found-page"><h2>404: Page Not Found</h2><button onClick={() => window.location.href = '/'}>Go Home</button></div>} />
            </Routes>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;