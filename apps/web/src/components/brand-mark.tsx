export function BrandMark({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 100 100"
			className={className}
			aria-hidden="true"
			focusable="false"
		>
			<path d="M5 6.5 93 4l3 88-89 4L4 41Z" fill="var(--brand-seal-ink)" />
			<path
				d="m10 11 78-1.5 2.5 77L12 90Z"
				fill="none"
				stroke="var(--brand-paper)"
				strokeWidth="2.5"
				strokeLinecap="square"
			/>
			<g
				fill="var(--brand-paper)"
				fontFamily="Yu Mincho, Hiragino Mincho ProN, serif"
				fontWeight="700"
				textAnchor="middle"
			>
				<text x="49" y="46" fontSize="42">
					工
				</text>
				<text x="50" y="84" fontSize="42">
					芸
				</text>
			</g>
		</svg>
	);
}
