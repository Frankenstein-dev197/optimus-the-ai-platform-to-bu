import type { FC } from "react";
import { getApplicationName, getLogoURL } from "#/utils/appearance";
import { cn } from "#/utils/cn";
import { ExternalImage } from "../ExternalImage/ExternalImage";

/**
 * Enterprise customers can set a custom logo for their Optimus application.
 * Use the custom logo wherever the Optimus logo is used, if a custom one is
 * provided.
 */
export const ProductLogo: FC<{ className?: string }> = ({ className }) => {
	const applicationName = getApplicationName();
	const logoURL = getLogoURL();

	return logoURL ? (
		<ExternalImage
			alt={applicationName}
			src={logoURL}
			// This prevent browser to display the ugly error icon if the
			// image path is wrong or user didn't finish typing the url
			onError={(e) => {
				e.currentTarget.style.display = "none";
			}}
			onLoad={(e) => {
				e.currentTarget.style.display = "inline";
			}}
			className={cn("h-12 max-w-[200px] application-logo", className)}
		/>
	) : (
		<OptimusLogo className={cn("h-12", className)} />
	);
};

const OptimusLogo: FC<React.ComponentProps<"svg">> = ({
	className,
	...props
}) => (
	<svg
		// This is a case where prop order does matter. We want fill to be easy
		// to override, but all other local props should stay locked down
		fill="currentColor"
		{...props}
		className={cn("h-7 aspect-square text-content-primary", className)}
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
);
