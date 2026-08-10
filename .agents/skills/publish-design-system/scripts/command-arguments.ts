export function commandArguments(arguments_: string[]) {
	return {
		primary: arguments_[0],
		option(name: string) {
			const index = arguments_.indexOf(name);
			return index === -1 ? undefined : arguments_[index + 1];
		},
		options(name: string) {
			return arguments_.flatMap((argument, index) =>
				argument === name && arguments_[index + 1]
					? [arguments_[index + 1] as string]
					: [],
			);
		},
	};
}
