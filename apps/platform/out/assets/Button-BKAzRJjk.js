import{Ft as e}from"./radix-ui-BltpLS8E.js";import{t}from"./cn-CcU7hTTa.js";import{i as n}from"./emotion-Gs6oPiCL.js";import{t as r}from"./dist-DiDikc8X.js";var i=r(`
	group inline-flex items-center justify-center gap-1 whitespace-nowrap font-sans
	border-solid rounded-md transition-colors shrink-0
	text-sm font-medium cursor-pointer no-underline
	focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-content-link
	disabled:pointer-events-none disabled:text-content-disabled
	[&:is(a):not([href])]:pointer-events-none [&:is(a):not([href])]:text-content-disabled
	[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg]:p-0.5
	[&>img]:pointer-events-none [&>img]:shrink-0 [&>img]:p-0.5
	`,{variants:{variant:{default:`
					border-none bg-surface-invert-primary font-semibold text-content-invert
					hover:bg-surface-invert-secondary
					disabled:bg-surface-secondary
					`,outline:`
					border border-border-default bg-transparent text-content-primary
					hover:bg-surface-secondary
					`,subtle:`
					border-none bg-transparent text-content-secondary
					hover:text-content-primary
					`,destructive:`
					border border-border-destructive font-semibold text-content-primary bg-surface-destructive
					hover:bg-transparent
					disabled:bg-transparent disabled:text-content-disabled
					`},size:{lg:`min-w-20 h-10 px-3 py-2 [&>svg]:size-icon-lg [&>img]:size-icon-lg`,sm:`min-w-20 h-8 px-2 py-1.5 text-xs [&>svg]:size-icon-sm [&>img]:size-icon-sm`,xs:`min-w-8 py-1 px-2 text-2xs rounded-md`,icon:`size-8 px-1.5 [&>svg]:size-icon-sm [&>img]:size-icon-sm`,"icon-lg":`size-10 px-2 [&>svg]:size-icon-lg [&>img]:size-icon-lg`}},defaultVariants:{variant:`default`,size:`lg`}}),a=({className:r,variant:a,size:o,asChild:s=!1,...c})=>{let l=s?e:`button`;return!s&&!c.type&&(c.type=`button`),n(l,{...c,className:t(i({variant:a,size:o}),r)})};export{a as t};