import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { REGISTER_URL, LOGIN_URL } from "../urls";

// create the useAuth hook with its own context
export const AuthContext = React.createContext();

const initialAuthState = {
	isAuthenticated: false,
	isLoading: false,
	error: "",
	id: "",
	name: "",
	email: "",
	password: "",
	token: "",
};

export const AuthProvider = ({ children }) => {
	const [auth, setAuth] = useState(initialAuthState);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

	// LOGIN
	const submitLogin = async (e, userData) => {
		setAuth({ ...auth, isLoading: true })
		if (e) e.preventDefault();
		let newAuth = { ...auth };
		newAuth.email = userData.email;
		newAuth.password = userData.password;
		console.log("submitLogin -> ", userData.email);

		try {
			const response = await axios.post(LOGIN_URL, userData, {
				headers: {
					"Content-Type": "application/json",
				}
			});
			console.log("submitLogin -> response: ", response);
			if (response.status === 200) {
				toast.success("Login success");

				newAuth.isAuthenticated = true;
				newAuth.isLoading = false;
				newAuth.error = "";
				newAuth.id = response?.data?.user?._id;
				newAuth.name = response?.data?.user?.name;
				newAuth.email = response?.data?.user?.email;
				newAuth.token = response?.data?.token;

				sessionStorage.setItem("token", response.data.token);
				navigate(from, { replace: true });
			}
		} catch (error) {
			console.log("submitLogin -> error: ", error);
			// toast.error(<div>
			// 	Erro no Login! <br />
			// 	{error?.response?.data?.error || error?.message}
			// </div>);

			newAuth.isAuthenticated = false;
			newAuth.isLoading = false;
			newAuth.error = error?.response?.data?.error;
		}
		setAuth(newAuth);
	};

	// DEVE-SE ALTERAR PARA FAZER O REGISTRO
	const submitRegister = async (e, userData) => {
		setAuth({ ...auth, isLoading: true })
		if (e) e.preventDefault();
		let newAuth = { ...auth };

		newAuth.name = userData.name;
		newAuth.email = userData.email;
		newAuth.password = userData.password;
		newAuth.confirmPassword = userData.confirmPassword;

		console.log("submitRegister -> ", userData.name, userData.email);

		try {
			const response = await axios.post(REGISTER_URL, userData, {
				headers: {
					"Content-Type": "application/json",
				}
			});
			console.log("submitRegister -> response: ", response);
			if (response.status === 201) {
				toast.success("Register success");

				newAuth.isLoading = false;
				newAuth.error = "";

				navigate("/login", { replace: true });
			}
		} catch (error) {
			console.log("submitRegister -> error: ", error);

			// toast.error(<div>
			// 	Erro ao Registar-se! <br />
			// 	{error?.response?.data?.error || error?.message}
			// </div>);

			newAuth.isAuthenticated = false;
			newAuth.isLoading = false;
			newAuth.error = error?.response?.data?.error || "Register Failed";
		}
		setAuth(newAuth);
	};

	// LOGOUT
	const submitLogout = () => {
		sessionStorage.clear();
		setAuth(initialAuthState);
		toast.success("Logout success");
		navigate("/login", { replace: true });
	}

	// Função para verificar se o token está expirado
  const isTokenExpired = (token) => {
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return tokenData.exp < currentTime;
  };

  // Verifica se há um token salvo no sessionStorage ao montar o componente
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      if (!isTokenExpired(token)) {
        // Token válido, define o estado de autenticação como autenticado
        setAuth((prevAuth) => ({
          ...prevAuth,
          isAuthenticated: true,
          isLoading: false,
          token: token,
        }));
      } else {
        // Token expirado, faz logout
        // submitLogout();
      }
    } else {
      // Não há token, define o estado de autenticação como não autenticado
      setAuth((prevAuth) => ({
        ...prevAuth,
        isLoading: false,
      }));
    }
  }, []);

	// pass the value in the provider and return it
	return (
		<AuthContext.Provider value={{ auth, submitLogin, submitRegister, submitLogout }}>
			{children}
		</AuthContext.Provider>
	);
};

export function useAuth() {
	const context = useContext(AuthContext);
	return context;
}
