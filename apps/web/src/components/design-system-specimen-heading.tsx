export function DesignSystemSpecimenHeading({
	number,
	title,
	description,
}: {
	number: string;
	title: string;
	description: string;
}) {
	return (
		<div className="preview-control-heading">
			<p>{number}</p>
			<h3>{title}</h3>
			<span>{description}</span>
		</div>
	);
}
