import React from "react";
import { Outlet } from "react-router-dom";

export default function Layout() {
	return (
		<div>
			<div className="layout_content">
				<Outlet />
			</div>
		</div>
	);
}
