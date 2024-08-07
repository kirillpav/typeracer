"use client";
import quotes from "../json/quotes.json";
import { useState, useEffect, useMemo, ReactElement } from "react";
import classNames from "classnames";
import styles from "../styles/Home.module.css";
type Word = {
	word: string;
};

export default function Home() {
	const [words, setWords] = useState([]);
	const [text, setText] = useState<string>("");
	const [activeButton, setActiveButton] = useState<number>();
	const [currentWord, setCurrentWord] = useState<string>();
	const textSplit = useMemo(() => words.join(" ").split(" ") ?? [], [words]);
	const [wordIdx, setWordIdx] = useState<number>(0);
	const [correctWords, setCorrectWords] = useState<Array<boolean | null>>(
		Array(20).fill(null)
	);
	const [topScore, setTopScore] = useState<number>(0);
	const [score, setScore] = useState<number>(0);
	const [userSetLength, setUserSetLength] = useState<number>(20);
	const [keyPressCount, setKeyPressCount] = useState<number>(0);
	// Time Calculation
	const [startTime, setStartTime] = useState<number | null>(null);
	const [endTime, setEndTime] = useState<number | null>(null);
	const [timeElapsed, setTimeElapsed] = useState<number | null>(null);
	// Character Accuracy
	const [correctCharCount, setCorrectCharCount] = useState<number>(0);
	const [totalCharCount, setTotalCharCount] = useState<number>(0);

	const fetchRandomWord = (length: number) => {
		return fetch(`https://random-word-api.herokuapp.com/word?number=${length}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network resposne not ok");
				}
				return response.json();
			})
			.then((data) => {
				console.log(data);
				setWords(data);
				return data;
			})
			.catch((error) => console.error(error));
	};

	const handleButtonClick = (length: number) => {
		setUserSetLength(length);
		setActiveButton(length);
		fetchRandomWord(length).then((fetchedWords) => {
			setWords(fetchedWords);
			setCorrectWords(Array(length).fill(null));
			setScore(0);
			setWordIdx(0);
			setText("");
			setKeyPressCount(0);
			setStartTime(null);
			setEndTime(null);
			setTimeElapsed(null);
			setCorrectCharCount(0);
			setTotalCharCount(0);
		});
	};

	const handleTryAgain = () => {
		setCorrectWords(Array(length).fill(null));
		fetchRandomWord(userSetLength);
		setScore(0);
		setWordIdx(0);
		setText("");
		setKeyPressCount(0);
		setStartTime(null);
		setEndTime(null);
		setTimeElapsed(null);
		setCorrectCharCount(0);
		setTotalCharCount(0);
	};

	useEffect(() => {
		setWordIdx(0);
		setText("");
	}, [textSplit]);

	useEffect(() => {
		setCurrentWord(textSplit[wordIdx]);
	}, [wordIdx, textSplit]);

	// Use effect to evaluate user input
	useEffect(() => {
		const latestLetter = text?.charAt(text.length - 1);
		if (latestLetter != " " && wordIdx != textSplit.length) return;
		const textWithoutTrailingSpace = text?.trim();
		if (textWithoutTrailingSpace === currentWord) {
			console.log(`Current Word: ${currentWord}`);
			setText("");
			setWordIdx(() => wordIdx + 1);
			setScore(score + 1);
			setCorrectWords((prev) => {
				const newCorrectWords = [...prev];
				newCorrectWords[wordIdx] = true;
				return newCorrectWords;
			});
		} else {
			setCorrectWords((prev) => {
				setText("");
				setWordIdx(() => wordIdx + 1);
				const newCorrectWords = [...prev];
				newCorrectWords[wordIdx] = false;
				return newCorrectWords;
			});
		}
		if (wordIdx === textSplit.length - 1) {
			setEndTime(Date.now());
		}
	}, [text, currentWord, wordIdx, textSplit]);

	// Handling input Change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (startTime === null) {
			setStartTime(Date.now());
		}

		const value = e.target.value;
		const lastChar = value.slice(-1);

		if (lastChar !== " " && lastChar !== "\b") {
			setTotalCharCount((prevCount) => prevCount + 1);
		}

		setText(value);
		setKeyPressCount((prevCount) => prevCount + 1);

		if (currentWord) {
			const correctChars = value
				.split("")
				.filter((char, idx) => char === currentWord[idx]).length;
			setCorrectCharCount(correctChars); // Update to set the count directly
		}
	};

	useEffect(() => {
		if (startTime && endTime) {
			setTimeElapsed((endTime - startTime) / 1000);
		}
	});

	const calculateWPM = () => {
		if (!timeElapsed) return 0;
		const minutes = timeElapsed / 60;
		const words = keyPressCount / 5;
		return words / minutes;
	};

	// const calculateAccuracy = () => {
	// 	if (keyPressCount === 0) return 0;
	// 	return ((correctCharCount / totalCharCount) * 100).toFixed(2);
	// };

	return (
		<div className="px-20">
			<h1 className={styles.title}>TYPED</h1>

			<div className={styles.container}>
				<div className={styles.settingsContainer}>
					<div>
						<button onClick={() => handleButtonClick(15)}>15</button>
						<span>/</span>
						<button onClick={() => handleButtonClick(20)}>20</button>
						<span>/</span>
						<button onClick={() => handleButtonClick(25)}>25</button>
						<span>/</span>
						<button onClick={() => handleButtonClick(50)}>50</button>
					</div>
					<p>
						Correct Words: {score} out of {words.length}
					</p>
					<div>
						<p>WPM: {calculateWPM().toFixed(0)}</p>
						{/* <p>ACC: {calculateAccuracy()}%</p> */}
					</div>
				</div>
				<div className={styles.wordsContainer}>
					<p className={styles.mainText}>
						{textSplit.map((word, idx) => (
							<>
								<span
									key={idx}
									className={classNames({
										[styles.currentWord]: idx === wordIdx,
										[styles.correctWord]: correctWords[idx] === true,
										[styles.wrongWord]: correctWords[idx] === false,
									})}
								>
									{word}
								</span>
								<span> </span>
							</>
						))}
					</p>
					<div className={styles.inputContainer}>
						<input
							className={styles.input}
							onChange={handleInputChange}
							value={text}
						></input>
						<button onClick={handleTryAgain} className={styles.btn}>
							Try Again
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
