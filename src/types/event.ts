//
export type FormEvent = React.FormEvent<HTMLFormElement>;
//
export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;
//
export type ChangeSet = {
	name: string;
	value: string;
};

export type ChangeFunction = (e: ChangeEvent) => void;
//
export type MouseEvent = React.MouseEvent<HTMLButtonElement>;
