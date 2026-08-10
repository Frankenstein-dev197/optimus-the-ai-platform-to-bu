export const pageTitle = (
	...crumbs: Array<string | boolean | undefined | null>
): string => {
	return [...crumbs, "Optimus"].filter(Boolean).join(" - ");
};
