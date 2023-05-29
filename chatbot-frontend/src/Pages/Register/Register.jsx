import React, { useEffect, useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import styles from "./Register.module.css";
import { useAuth } from "../../hooks/useAuth";
import { Robot } from "@phosphor-icons/react";

export default function Register() {
	const { auth, submitRegister } = useAuth();
	const isLoading = auth?.isLoading;
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleSubmitRegister = (e) => {
		e.preventDefault();
		console.log("handleSubmitRegister", email, name);
		submitRegister(e, { name, email, password, confirmPassword});
	};

	return (
		<div className={styles.register_page}>
			<div className={styles.register_logo_wrapper}>
				<Robot size={96} />
				Sapienth
				<p>AI chatbot assistant</p>
			</div>
			<Form
				className={styles.register_wrapper}
				onSubmit={(e) => handleSubmitRegister(e)}
			>
				<div className={styles.register_upper_section}>Registo</div>
				<Form.Group
					className={styles.register_form_field}
					controlId="formBasicUsername"
				>
					<Form.Label>Name</Form.Label>
					<Form.Control
						onChange={(e) => setName(e.target.value)}
						value={name}
						type="username"
						placeholder="Nome"
					/>
				</Form.Group>

				<Form.Group
					className={styles.register_form_field}
					controlId="formBasicEmail"
				>
					<Form.Label>Email address</Form.Label>
					<Form.Control
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						type="email"
						placeholder="Email"
					/>
					<Form.Text className="text-muted">
						Nunca partilharemos seu email com ninguém.
					</Form.Text>
				</Form.Group>
				<Form.Group
					className={styles.register_form_field}
					controlId="formBasicPassword"
				>
					<Form.Label>Senha</Form.Label>
					<Form.Control
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						type="password"
						placeholder="Senha"
					/>
				</Form.Group>
				<Form.Group
					className={styles.register_form_field}
					controlId="formBasicPassword"
				>
					<Form.Label>Confirme a Senha</Form.Label>
					<Form.Control
						onChange={(e) => setConfirmPassword(e.target.value)}
						value={confirmPassword}
						type="password"
						placeholder="Senha"
					/>
				</Form.Group>
				{auth.error && (
					<Form.Group className={styles.register_error}>
						<Form.Text className={styles.register_error_text}>
							{auth.error}
						</Form.Text>
					</Form.Group>
				)}
				<Form.Group className={styles.register_form_field_bottom_section}>
					<Button
						className={styles.register_form_register_button}
						variant="secondary"
						type="submit"
					>
						{isLoading ? (
								<Spinner
									as="span"
									animation="border"
									size="sm"
									role="status"
									aria-hidden="true"
								/>
							) : (
								<>register</>
							)}
					</Button>
				</Form.Group>
				<Form.Group className={styles.register_login}>
					<Form.Text className={styles.register_login_text}>
						Já tens conta? <a href="/login">Faz Login</a>
					</Form.Text>
				</Form.Group>
			</Form>
		</div>
	);
}
