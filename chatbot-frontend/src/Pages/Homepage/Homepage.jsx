import { useState, useEffect } from "react";
import styles from "./Homepage.module.css";
import {
	ChatCircle,
	GithubLogo,
	PaperPlaneRight,
	Robot,
	TrashSimple,
} from "@phosphor-icons/react";
import { Button, FormControl } from "react-bootstrap";
import axios from "axios";

const Homepage = () => {
	const [value, setValue] = useState("");
	const [message, setMessage] = useState(null);
	const [previousChats, setPreviousChats] = useState([]);
	const [currentTitle, setCurrentTitle] = useState(null);

	// Resets the current chat
	const createNewChat = () => {
		setValue("");
		setMessage(null);
		setCurrentTitle(null);
	};

	const handleClick = (uniqueTitle) => {
		setValue("");
		setMessage(null);
		setCurrentTitle(uniqueTitle);
	};

	const handleEmptyHistory = () => {
		setPreviousChats([]);
		setValue("");
		setMessage(null);
		setCurrentTitle(null);
	};

	/*
		Simple async function that fetches the messages from the API
	*/
	const getMessages = async () => {
		// Cleaning the input field
		// setValue("");
		try {
			// change this url for one in the .env file
			const response = await axios.post(
				"http://localhost:8000/completions",
				JSON.stringify({
					message: value,
				}),
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			console.log(response?.data);
			setMessage(response?.data?.choices[0]?.message);
		} catch (error) {
			console.error(error);
		}
	};

	/* 
		UseEffect triggered by message and/or currentTitle state changes
	*/
	useEffect(() => {
		// console.log(currentTitle, value, message);
		if (!currentTitle && value && message) {
			/*
				If there is no current title, but we've recieved a value and a message
				we set the current title as the value of the input (user message)
			*/
			setCurrentTitle(value);
		}
		if (currentTitle && value && message) {
			/* 
				Saves the current chat and the previous one
				while also updating the current chat
				and savin the first message asked by the user
				as the title of the conversation 
			*/
			setPreviousChats((prevChats) => [
				...prevChats,
				{
					title: currentTitle,
					// Later, change this to the username retrieved from AUTH
					role: "user",
					content: value,
				},
				{
					title: currentTitle,
					role: message.role,
					content: message.content,
				},
			]);
			setValue("");
		}
	}, [message, currentTitle]);

	/* 
		filters the previous chats by the current title and stores 
		the current chat if it matches the current title 
	*/
	const currentChat = previousChats.filter(
		(previousChat) => previousChat.title === currentTitle
	);

	// creates an array of unique titles from the previous chats
	const uniqueTitles = Array.from(
		new Set(previousChats.map((previousChat) => previousChat.title))
	);

	return (
		<div className={styles.homepage}>
			<section className={styles.side_bar}>
				<Button onClick={createNewChat} className={styles.btn_new_chat}>
					+ New Chat
				</Button>
				<ul className={styles.chat_history}>
					{uniqueTitles?.map((uniqueTitle, index) => (
						<li
							onClick={() => handleClick(uniqueTitle)}
							key={index}
							className={uniqueTitle === currentTitle ? styles.active : ""}
						>
							<ChatCircle size={20} />
							<span>{uniqueTitle}</span>
						</li>
					))}
				</ul>

				<span className={styles.footer_github}>
					{previousChats.length > 0 && (
						<Button
							onClick={handleEmptyHistory}
							className={styles.btn_empty_history}
						>
							<TrashSimple size={20} />
							Empty history
						</Button>
					)}
					<a
						href="https://github.com/vbmelo"
						target="_blank"
						rel="https://github.com/vbmelo"
					>
						<GithubLogo size={22} color="var(--gray-400)" />
						Made by Victor Melo
					</a>
				</span>
			</section>
			<section className={styles.main}>
				<h1 className={styles.sapienth_logo}>
					<Robot size={36} />
					Sapienth
				</h1>
				<ul className={styles.text_feed}>
					{currentChat?.map((chatMessage, index) => (
						<li key={index}>
							<span className={styles.feed_role}>{chatMessage.role}</span>
							<span>{chatMessage.content}</span>
						</li>
					))}
				</ul>
				<div className={styles.bottom_wrapper}>
					<div className={styles.input_wrapper}>
						<FormControl
							value={value}
							onChange={(e) => setValue(e.target.value)}
							className={styles.input_field}
							type="text"
							maxLength={256}
							onKeyPress={(e) => {
								if (e.key === "Enter") {
									getMessages();
								}
							}}
						/>
						<button onClick={getMessages} className={styles.btn_submit}>
							<PaperPlaneRight size={20} />
						</button>
					</div>
					<p className={`${styles.info} text-muted`}>
						Powered by Chat GPT Free Research Preview.
					</p>
				</div>
			</section>
		</div>
	);
};

export default Homepage;
