import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route } from "react-router-dom";
import Login from "./Pages/Login/Login";
import Register from "./pages/Register/Register";
import Layout from "./layouts/Layout";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Homepage from "./Pages/Homepage/Homepage";

function App() {
	const { auth } = useAuth();
	return (
		<Routes>
			{/* Rotas não Autenticadas */}
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			{/* Rotas Já Autenticadas*/}
			<Route
				element={
					<ProtectedRoute
						redirectPath="/login"
						isAllowed={!!auth.isAuthenticated}
					/>
				}
			>
				<Route path="/" element={<Layout />}>
					<Route index element={<Homepage />} />
				</Route>
			</Route>
			<Route
				path="*"
				element={
					<h1 className="bg-dark d-flex align-items-center justify-content-center w-100 h-100 p-5">
						There's nothing here: 404!
					</h1>
				}
			/>
		</Routes>
	);
}

export default App;
