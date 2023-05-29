require("dotenv").config();
const PORT = 8000;
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

// MODELS
const User = require("./models/user");

// CONNECTION TO OPEN AI API
/* 
		-Model: defines the engine to use
		-Messages: is the input that is passed by the frontend (user input)
		-Max tokens: is the maximum amount of tokens that the AI can return 
		(100 tokens limit to prevent going over the token budget) 
		- Chatbot's name is defined as "Sapienth" through the first system message
		- User's message is passed as the second message
		- Token is verified by checkToken middleware
	*/
app.post("/completions", checkToken, async (req, res) => {
	const options = {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: "gpt-3.5-turbo",
			messages: [
        { role: "system", content: "Sapienth" },
        { role: "user", content: req.body.message },
      ],
			max_tokens: 100,
		}),
	};
	try {
		const response = await fetch(
			"https://api.openai.com/v1/chat/completions",
			options
		);
		const data = await response.json();
		res.send(data);
	} catch (error) {
		console.error(error);
	}
});
// CONNECTION TO OPEN AI API

// OPEN ROUTE - PUBLIC ROUTE
app.get("/", (req, res) => {
	res.status(200).json({ message: "Welcome to the API!" });
});

// PRIVATE ROUTE
app.get("/user/:id", checkToken, async (req, res) => {
	const id = req.params.id;

	/*
	 Check if user exists
	 - passowrd is excluded from the query by the '-password' argument (filter)
	 - if found, user object is returned without the password
	 		because we don't want to send the password to the frontend
	*/
	const user = await User.findById(id, '-password');
	// If user isn't found
	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}

	res.status(200).json({ user });
})

/*	
	MIDDLEWARE 
	- checks if the token is valid through jwt.verify()
		that compares the token with the secret stored in the .env file
	- if valid, continue
*/
function checkToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ error: "Access denied" });
	}

	try {
		const secret = process.env.JWT_SECRET;
		jwt.verify(token, secret);

		next();

	} catch (error) {
		console.log(error);
		res.status(400).json({error: "Invalid token"})
	}
}

// REGISTER USER
app.post("/auth/register", async (req, res) => {
	const { name, email, password, confirmPassword } = req.body;

	if (!name) {
		return res.status(422).json({ error: "Name is required" });
	}

	if (!email) {
		return res.status(422).json({ error: "Email is required" });
	}

	if (!password) {
		return res.status(422).json({ error: "Password is required" });
	}

	if (password !== confirmPassword) {
		return res.status(422).json({ error: "Passwords do not match" });
	}

	// CHECK IF USER EXISTS
	const userExists = await User.findOne({ email: email });
	// If user already exists with the same email address then...
	if (userExists) {
		return res
			.status(422)
			.json({ error: "Email already exists, please use another email" });
	}

	/* 
		CREATE PASSWORD
		- salt: random string that is added to the password before hashing
		- hashedPassword: the password that is hashed with the salt (random string)
	*/
	const salt = await bcrypt.genSalt(12);
	const hashedPassword = await bcrypt.hash(password, salt);

	// CREATE USER
	const user = new User({
		name,
		email,
		password: hashedPassword,
	});

	try {
		await user.save();
		res.status(201).json({ message: "User created successfully!" });
	} catch (error) {
		console.log(error);
		res.status(500).json({error: "Something went wrong, try again later" });
	}
});

// LOGIN USER
app.post("/auth/login", async (req, res) => {
	const { email, password } = req.body;

	// Validations
	if (!email) {
		return res.status(422).json({ error: "Email is required" });
	}
	if (!password) {
		return res.status(422).json({ error: "Password is required" });
	}

	/*
	 CHECK IF USER EXISTS
	 - if found, user object is returned with all the user data!
	*/
	const user = await User.findOne({ email: email })
	// If user does not exist
	if (!user) {
		return res
			.status(404)
			.json({ error: "No user was found with this email." })
	}

	/* \
		CHECK IF PASSWORD MATCHES
		- uses bcrypt to compare the password returned by User.findOne()
			with the hashed password
		- if found, continue
	*/
	const checkPassword = await bcrypt.compare(password, user.password)
	// If password doesn't match
	if (!checkPassword) {
		return res
			.status(422)
			.json({ error: "Wrong password, try again." })
	}

	// JWT
	try {
		const secret = process.env.JWT_SECRET;

		// Create token with user id and the secret from .env
		const token = jwt.sign({ 
				id: user._id 
			}, 
			secret,
			{ expiresIn: "1h" }
		)

		userWithoutPassword = {
			_id: user._id,
			name: user.name,
			email: user.email,
		}

		res.status(200).json({ message: "User logged in successfully!", token, user: userWithoutPassword })

	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Something went wrong, try again later" })
	}
});

// CREDENTIALS
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

/*
	CONNECTION TO MONGODB
	- if the connection fails it will retry after 5000ms (5sec)
	- timeout set to 1ms for development
*/
function connectWithRetry() {
	mongoose
		.connect(
			`mongodb+srv://${dbUser}:${dbPassword}@cluster0.rnukme9.mongodb.net/?retryWrites=true&w=majority`
		)
		.then(() => {
			console.log("Connected to MongoDB!");
			app.listen(PORT, () => console.log("Server running on PORT", PORT));
		})
		.catch((error) => {
			console.error("Failed to connect to MongoDB:", error);
			// Try again in 3 seconds
			setTimeout(() => {
				console.log("Retrying Conection with the Database...");
				connectWithRetry();
			}, 1000);
		});
}

connectWithRetry();