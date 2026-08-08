import { isPixel } from "@optimus-ide-collab/pixel-storybook/storyapi";
import type { FC } from "react";
import { pageTitle } from "#/utils/page";
import { CliInstallPageView } from "./CliInstallPageView";

const CliInstallPage: FC = () => {
	const origin = isPixel() ? "https://example.com" : location.origin;

	return (
		<>
			<title>{pageTitle("Install the Optimus IDE Collab CLI")}</title>
			<CliInstallPageView origin={origin} />
		</>
	);
};

export default CliInstallPage;
