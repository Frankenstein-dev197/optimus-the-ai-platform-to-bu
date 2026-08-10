import type { FC } from "react";
import { Link } from "react-router";
import { LunarLander } from "./LunarLander";

const OptimusCupPage: FC = () => {
	return (
		<div className="relative w-screen h-screen bg-black overflow-hidden">
			<title>Codernauts</title>

			{/* Optimus logo - links back to the main app */}
			<Link
				to="/workspaces"
				className="absolute top-3 left-3 z-10 opacity-60 hover:opacity-100 transition-opacity"
			>
				<svg
					fill="currentColor"
					className="w-8 h-8 text-white"
					viewBox="0 0 120 120"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>Optimus logo</title>
					<path
						fillRule="evenodd"
						d="M60 4.68 107.109 31.59 107.109 85.41 60 112.32 12.891 85.41 12.891 31.59 Z M60 23.4 90.397 40.95 90.397 76.05 60 93.6 29.603 76.05 29.603 40.95 Z"
					/>
					<path d="M60 50.31 67.093 54.405 67.093 62.595 60 66.69 52.907 62.595 52.907 54.405 Z" />
				</svg>
			</Link>

			<LunarLander />
		</div>
	);
};

export default OptimusCupPage;
