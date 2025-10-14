"use client";

import React, { useState, useRef, useEffect } from "react";
import { RotateCcw, Trophy, Zap, Keyboard, Sun, Moon } from "lucide-react";

type Language = 'english' | 'japanese';

const defaultEnglishTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once. It has been used for testing typewriters and computer keyboards since the late 19th century. The phrase is also used in font displays and design mockups.",
  "Programming is the art of telling another human what one wants the computer to do. Code is read more often than it is written, so it's important to write clear and maintainable code. Good programmers write code that humans can understand, not just machines.",
  "The beauty of nature never fails to inspire us. From towering mountains to gentle streams, from vast oceans to tiny flowers, every element of nature has its own unique charm. Taking time to appreciate the natural world around us can bring peace and perspective to our busy lives.",
  "Learning is a lifelong journey that never truly ends. Every experience, whether success or failure, teaches us valuable lessons. The key is to remain curious, stay humble, and never stop asking questions. Knowledge grows when it is shared with others.",
  "Technology has transformed the way we live, work, and communicate. The internet connects billions of people across the globe, enabling instant communication and access to information. As we move forward, it's important to use technology wisely and maintain our human connections.",
];

const defaultJapaneseTexts = [
  "はるさんハウスはどこですか。今日はいい天気ですね。日本語のタイピング練習をしています。",
  "こんにちは、元気ですか。今日はいい天気ですね。プログラミングの勉強をしています。",
  "日本語のタイピング練習をしています。頑張りましょう。コンピューターの技術は日々進歩しています。",
  "東京は日本の首都です。多くの人々が住んでいます。新しい技術と伝統が共存している素晴らしい都市です。"
];

export default function TypingPractice() {
  const [language, setLanguage] = useState<Language>('english');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentText, setCurrentText] = useState(defaultEnglishTexts[0]);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('typing-master-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setTheme(defaultTheme);
      document.documentElement.setAttribute('data-theme', defaultTheme);
    }
  }, []);

  useEffect(() => {
    if (activeCharRef.current && textContainerRef.current) {
      const container = textContainerRef.current;
      const activeChar = activeCharRef.current;
      const containerRect = container.getBoundingClientRect();
      const charRect = activeChar.getBoundingClientRect();

      if (charRect.top > containerRect.bottom - 100) {
        activeChar.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [userInput]);

  useEffect(() => {
    const calculateStats = () => {
      if (!startTime) return;

      const timeElapsed = (Date.now() - startTime) / 1000 / 60;
      const wordsTyped = currentText.length / 5;
      const calculatedWpm = Math.round(wordsTyped / timeElapsed);

      let correctChars = 0;
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] === currentText[i]) correctChars++;
      }
      const calculatedAccuracy = Math.round(
        (correctChars / userInput.length) * 100
      );

      setWpm(calculatedWpm);
      setAccuracy(calculatedAccuracy);
    };

    if (userInput.length === currentText.length && !isComplete) {
      setIsComplete(true);
      calculateStats();
    }
  }, [userInput, currentText, isComplete, startTime]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComplete) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      setUserInput((prev) => prev.slice(0, -1));
    } else if (e.key.length === 1) {
      e.preventDefault();
      if (userInput.length < currentText.length) {
        setUserInput((prev) => prev + e.key);
      }
    }
  };

  const reset = () => {
    setUserInput("");
    setStartTime(null);
    setIsComplete(false);
    setWpm(0);
    setAccuracy(100);
  };

  const fetchEnglishText = async (): Promise<string> => {
    try {
      setIsLoading(true);
      setFetchError(null);

      const response = await fetch('/api/fetch-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://www.foxnews.com/',
          language: 'english'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch English text');
      }


      const data = await response.json();
      return data.text || getRandomText('english');
    } catch (error) {
      setFetchError(`${error} - Failed to fetch new English text. Using default text.`);
      return getRandomText('english');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJapaneseText = async (): Promise<string> => {
    try {
      setIsLoading(true);
      setFetchError(null);

      const response = await fetch('/api/fetch-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://www3.nhk.or.jp/nhkworld/ja/',
          language: 'japanese'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Japanese text');
      }

      const data = await response.json();
      return data.text || getRandomText('japanese');
    } catch (error) {
      setFetchError(`${error} - Failed to fetch new Japanese text. Using default text.`);
      return getRandomText('japanese');
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomText = (lang: Language): string => {
    const texts = lang === 'english' ? defaultEnglishTexts : defaultJapaneseTexts;
    return texts[Math.floor(Math.random() * texts.length)];
  };

  const newText = async () => {
    let randomText: string;

    if (language === 'english') {
      randomText = await fetchEnglishText();
    } else {
      randomText = await fetchJapaneseText();
    }

    setCurrentText(randomText);
    reset();
  };

  const switchLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCurrentText(getRandomText(newLanguage));
    reset();
    setFetchError(null);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('typing-master-theme', newTheme);
  };

  const getCharClass = (index: number): string => {
    if (index >= userInput.length) {
      return index === userInput.length ? "bg-warning bg-opacity-30" : "";
    }
    return userInput[index] === currentText[index]
      ? "text-success font-semibold"
      : "text-error font-semibold bg-error bg-opacity-20";
  };

  return (
    <div
      className="min-h-screen bg-base-200 py-8 px-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      autoFocus
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3 relative">
            <Keyboard className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold text-primary">Typing Master</h1>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-outline btn-primary btn-circle absolute right-0 top-0 border-2"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-6 h-6" />
              ) : (
                <Sun className="w-6 h-6 text-yellow-400" />
              )}
            </button>
          </div>

          <div className="text-base-content text-lg opacity-70 mb-3">
            {language === 'english'
              ? 'English Typing Practice - Improve Speed and Accuracy'
              : 'Japanese Typing Practice - 日本語タイピング練習'}
          </div>

          {/* Language Selection */}
          <div className="flex justify-center gap-4 mb-3">
            <button
              onClick={() => switchLanguage('english')}
              className={`btn gap-2 ${language === 'english' ? 'btn-primary' : 'btn-outline btn-primary'}`}
              disabled={isLoading}
            >
              <span className="text-lg">🇺🇸</span>
              English
            </button>
            <button
              onClick={() => switchLanguage('japanese')}
              className={`btn gap-2 ${language === 'japanese' ? 'btn-primary' : 'btn-outline btn-primary'}`}
              disabled={isLoading}
            >
              <span className="text-lg">🇯🇵</span>
              日本語
            </button>
          </div>

          {/* Error Alert */}
          {fetchError && (
            <div className="alert alert-warning max-w-md mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm">{fetchError}</span>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Zap className="w-8 h-8" />
            </div>
            <div className="stat-title">Speed</div>
            <div className="stat-value text-primary">{wpm}</div>
            <div className="stat-desc">WPM (Words Per Minute)</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Accuracy</div>
            <div className="stat-value text-success">{accuracy}%</div>
            <div className="stat-desc">Correct typing rate</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <div
                className="radial-progress text-secondary"
                style={
                  {
                    "--value": Math.round(
                      (userInput.length / currentText.length) * 100
                    ),
                  } as React.CSSProperties & { "--value": number }
                }
                role="progressbar"
              >
                {Math.round((userInput.length / currentText.length) * 100)}%
              </div>
            </div>
            <div className="stat-title">Progress</div>
            <div className="stat-value text-secondary">{userInput.length}</div>
            <div className="stat-desc">/ {currentText.length} characters</div>
          </div>
        </div>

        {/* Typing Area */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div
              ref={textContainerRef}
              className="text-2xl leading-relaxed font-mono mb-6 max-h-96 overflow-y-auto p-4 rounded-lg bg-base-200 text-base-content"
            >
              {currentText.split("").map((char: string, index: number) => (
                <span
                  key={index}
                  ref={index === userInput.length ? activeCharRef : null}
                  className={`${getCharClass(index)} ${
                    index >= userInput.length ? "opacity-40" : ""
                  } transition-all duration-100`}
                >
                  {char}
                </span>
              ))}
            </div>

            {isComplete && (
              <div className="alert alert-success">
                <Trophy className="w-8 h-8" />
                <div>
                  <h3 className="font-bold text-lg">Excellent completion!</h3>
                  <div className="text-sm">
                    Speed: <span className="font-bold">{wpm} WPM</span> •
                    Accuracy: <span className="font-bold">{accuracy}%</span>
                  </div>
                </div>
              </div>
            )}

            {!isComplete && (
              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>
                  Start typing to practice. Press Backspace to delete
                  characters.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <button
            onClick={reset}
            className="btn btn-primary btn-lg gap-2"
            disabled={isLoading}
          >
            <RotateCcw size={20} />
            Reset
          </button>
          <button
            onClick={newText}
            className={`btn btn-secondary btn-lg gap-2 ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Zap size={20} />
            )}
            {isLoading ? 'Fetching...' : `New Text`}
          </button>
        </div>

        {/* Instructions */}
        {/* <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">
              <Keyboard className="w-6 h-6" />
              How to Use
            </h2>
            <div className="divider my-0"></div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="badge badge-success gap-2">✓</div>
                <span>
                  <span className="font-semibold text-success">
                    Correct characters
                  </span>{" "}
                  will be displayed in green
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="badge badge-error gap-2">✗</div>
                <span>
                  <span className="font-semibold text-error">
                    Incorrect characters
                  </span>{" "}
                  will be displayed in red with a light red background
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="badge badge-warning gap-2">→</div>
                <span>
                  The page will{" "}
                  <span className="font-semibold">auto-scroll</span> when you
                  type to the end of the screen
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="badge badge-info gap-2">⌨</div>
                <span>
                  Use <kbd className="kbd kbd-sm">Backspace</kbd> to delete
                  characters
                </span>
              </li>
            </ul>
          </div>
        </div> */}

        {/* Copyright Footer */}
        <footer className="text-center py-6 mt-8 border-t border-base-300">
          <p className="text-base-content text-sm opacity-60">
            © {new Date().getFullYear()} Typing Master. Created by{" "}
            <a
              href="mailto:hungnm.pnv@gmail.com"
              className="link link-primary hover:link-secondary transition-colors"
            >
              hungnm.pnv@gmail.com
            </a>
          </p>
        </footer>
      </div>

      {/* Add DaisyUI CDN */}
      <link
        href="https://cdn.jsdelivr.net/npm/daisyui@4.12.14/dist/full.min.css"
        rel="stylesheet"
        type="text/css"
      />
    </div>
  );
}
