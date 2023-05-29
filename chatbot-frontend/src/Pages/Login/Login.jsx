import React, { useEffect, useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import styles from "./Login.module.css";
import { useAuth } from "../../hooks/useAuth";
import { Robot } from "@phosphor-icons/react";

export default function Login() {
	const { auth, submitLogin } = useAuth();
	const isLoading = auth?.loading;
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmitLogin = (e) => {
		e.preventDefault();
		console.log("handleSubmitLogin", email, password);
		submitLogin(e, { email, password });
	};

	return (
		<div className={styles.login_page}>
			<div className={styles.login_logo_wrapper}>
				<Robot size={96} />
				Sapienth
				<p>AI chatbot assistant</p>
			</div>
			<Form
				className={styles.login_wrapper}
				onSubmit={(e) => handleSubmitLogin(e)}
			>
				<div className={styles.login_upper_section}>Login</div>
				<Form.Group
					className={styles.login_form_field}
					controlId="formBasicUsername"
				>
					<Form.Label>Email</Form.Label>
					<Form.Control
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						type="email"
						placeholder="Email"
					/>
				</Form.Group>

				<Form.Group
					className={styles.login_form_field}
					controlId="formBasicPassword"
				>
					<Form.Label>Password</Form.Label>
					<Form.Control
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						type="password"
						placeholder="Senha"
					/>
				</Form.Group>
				{auth.error && (
					<Form.Group className={styles.login_error}>
						<Form.Text className={styles.login_error_text}>
							{auth.error}
						</Form.Text>
					</Form.Group>
				)}
				<Form.Group className={styles.login_form_field_bottom_section}>
					<Button
						className={styles.login_form_login_button}
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
							<>login</>
						)}
					
					</Button>
				</Form.Group>
				<Form.Group className={styles.login_register}>
					<Form.Text className={styles.login_register_text}>
						Não tens conta? <a href="/register">Regista-te</a>
					</Form.Text>
				</Form.Group>
			</Form>
		</div>
	);
}
