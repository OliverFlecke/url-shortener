import React from 'react';
interface Props {
	children: React.ReactNode;
}
const Tooltip = ({ children }: Props) => (
	<span className="group relative inline-block">{children}</span>
);

const Text: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<span className="tooltip-content">{children}</span>
);
Tooltip.Text = Text;

export default Tooltip;
