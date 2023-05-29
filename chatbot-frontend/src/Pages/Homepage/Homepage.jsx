import { useState, useEffect } from "react";
import styles from "./Homepage.module.css";
import {
	ChatCircle,
	DotsThreeOutline,
	GithubLogo,
	PaperPlaneRight,
	Robot,
	SignOut,
	TrashSimple,
	X,
} from "@phosphor-icons/react";
import { Button, FormControl, Spinner, Offcanvas, OffcanvasBody } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { COMPLETIONS } from "../../urls";
import { useAuth } from "../../hooks/useAuth";

const Homepage = () => {
	const { auth, submitLogout } = useAuth();
	const username = auth?.name;
	const [value, setValue] = useState("");
	const [message, setMessage] = useState(null);
	const [previousChats, setPreviousChats] = useState([]);
	const [currentTitle, setCurrentTitle] = useState(null);
	const [loading, setLoading] = useState(false);
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

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
		setLoading(true);

		try {
			// change this url for one in the .env file
			const response = await axios.post(
				COMPLETIONS,
				JSON.stringify({
					message: value,
				}),
				{
					headers: {
						Authorization: `Bearer ${auth?.token}`,
						"Content-Type": "application/json",
					},
				}
			);
			console.log(response?.data);
			setMessage(response?.data?.choices[0]?.message);
			setLoading(false);
		} catch (error) {
			console.error(error);
			toast.error(
				<div>
					Erro! <br />
					{error?.response?.data?.error || error?.message}
				</div>
			);
			setLoading(false);
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
			{/* SIDEBAR */}
				<Offcanvas show={show} onHide={handleClose} responsive="lg" className={styles.offcanvas_side_bar}>

					<section className={styles.side_bar}>
						<div className={styles.side_bar_user}>
							<div className={styles.side_bar_user_name}>
								Olá, {username}
							</div>
							<Button onClick={submitLogout} className={styles.btn_logout}>
								<SignOut size={20} />
							</Button>
						</div>
						<Button onClick={createNewChat} className={styles.btn_new_chat}>
							+ New Chat
						</Button>
						{/* CHAT HISTORY */}
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
						{/* CHAT HISTORY */}
						{/* FOOTER */}
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
								{/* this color has to be in hex to fix offcanvas bug */}
								<GithubLogo size={20} color="#94a3b8" />
								Made by Victor Melo
							</a>
						</span>
						{/* FOOTER */}
					</section>
				</Offcanvas>
			{/* SIDEBAR */}

			{/* MAIN */}
				<section className={styles.main}>
					<div className={styles.sapienth_logo_wrapper}>
						<Button onClick={handleShow} className={styles.btn_toggle_menu}>
							<DotsThreeOutline size={20} />
						</Button>
						<h1 className={styles.sapienth_logo}>
							<Robot size={32} />
							Sapienth
						</h1>
					</div>
					<ul className={styles.text_feed}>
						{currentChat?.map((chatMessage, index) => (
							<li key={index}>
								<span className={styles.feed_role}>
									{chatMessage.role
										? chatMessage.role === "user"
											? username
											: "Sapienth"
										: "Sapienth"}
								</span>
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
								{loading ? (
									<Spinner
										as="span"
										animation="border"
										size="sm"
										role="status"
										aria-hidden="true"
									/>
								) : (
									<PaperPlaneRight size={20} />
								)}
							</button>
						</div>
						<p className={`${styles.info} text-muted`}>
							Powered by Chat GPT Free Research Preview.
						</p>
					</div>
				</section>
			{/* MAIN */}
		</div>
	);
};

export default Homepage;
