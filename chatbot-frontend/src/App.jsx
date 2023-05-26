import { useState, useEffect } from 'react';
import { GithubLogo, PaperPlaneRight, Robot } from "@phosphor-icons/react";
import { Button, FormControl } from "react-bootstrap";
import { Nav } from "react-bootstrap";

const App = () => {
	const [value, setValue] = useState("")
	const [message, setMessage] = useState(null)
	const [previousChats, setPreviousChats] = useState([])
	const [currentTitle, setCurrentTitle] = useState(null)

	// Resets the current chat
	const createNewChat = () => {
		setValue("")
		setMessage(null)
		setCurrentTitle(null)
	}


	const handleClick = (uniqueTitle) => {
		setValue("")
		setMessage(null)
		setCurrentTitle(uniqueTitle)
	}

	/*
		Simple async function that fetches the messages from the API
	*/
	const getMessages = async () => {
		const options = {
			method: 'POST',
			body: JSON.stringify({
				message: value
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}
		try {
			const response = await fetch('http://localhost:8000/completions', options)
			const data = await response.json()
			console.log(data)
			setMessage(data.choices[0].message)
		}catch(error){
			console.error(error);
		}
	}

	/* 
		UseEffect triggered by message and/or currentTitle state changes
	*/
	useEffect(() => {
		console.log(currentTitle, value, message)
		if (!currentTitle && value && message) {
			/*
				If there is no current title, but we've recieved a value and a message
				we set the current title as the value of the input (user message)
			*/
			setCurrentTitle(value)
		} 
		if (currentTitle && value && message) {
			/* 
				Saves the current chat and the previous one
				while also updating the current chat
				and savin the first message asked by the user
				as the title of the conversation 
			*/
			setPreviousChats(prevChats => (
				[...prevChats,
					{
						title: currentTitle,
						// Later, change this to the username retrieved from AUTH
						role: 'user',
						content: value
					},
					{
						title: currentTitle,
						role: message.role,
						content: message.content
					}
				]
			))
		}
	}, [message, currentTitle])

	const currentChat = previousChats.filter(previousChat => previousChat.title === currentTitle)

	const uniqueTitles = Array.from(new Set(previousChats.map(previousChat => previousChat.title)))

	return (
		<div className="app">
			<section className="side-bar">
				<Button onClick={createNewChat} className="btn-new-chat">+ New Chat</Button>
				<ul className="chat-history">
					{uniqueTitles?.map((uniqueTitle, index) => (
						<li onClick={() => handleClick(uniqueTitle)} key={index}>
							{uniqueTitle}
						</li>
					))}
				</ul>
				<span className='footer-github'>
					<a
						className="text-decoration-none"
						href="https://github.com/vbmelo"
						target="_blank"
						rel="https://github.com/vbmelo"
					>
						<GithubLogo size={24} />
						Made by Victor Melo
					</a>
				</span>
			</section>
			<section className="main">
				<h1><Robot size={36} />Sapienth</h1>
				<ul className="text-feed">
					{currentChat?.map((chatMessage, index) =>
					<li key={index}>
						<span className='feed-role'>{chatMessage.role}</span>
						<span className='feed-message'>{chatMessage.content}</span>
					</li>
					)}
				</ul>
				<div className="bottom-wrapper">
					<div className="input-wrapper">
						<FormControl 
							value={value} 
							onChange={(e) => setValue(e.target.value)}
							className="input-field" 
							type="text" 
							maxLength={256}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									getMessages()
								}
							}} 
						 />
						<button 
							onClick={getMessages} 
							className="submit-button"
						>
							<PaperPlaneRight size={20} className="text-black"/>
						</button>
					</div>
					<p className="info text-muted">
						Powered by Chat GPT Free Research Preview.
					</p>
				</div>
			</section>
		</div>
	);
};

export default App;
