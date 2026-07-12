"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cloneElement, isValidElement, type ReactNode, useRef } from "react";
import { useForm, useFormContext } from "react-hook-form";
import z from "zod";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";

const FormBase = ({
	schema,
	children,
	onSubmit,
	defaultValues,
	className,
}: {
	schema: z.ZodType<any, any, any>;
	children: ReactNode;
	onSubmit: (values: any) => void | Promise<void>;
	defaultValues?: Record<string, any>;
	className?: string;
}) => {
	const form = useForm({
		resolver: zodResolver(schema as z.ZodType<any, any, any>),
		...(defaultValues && { defaultValues }),
	});

	// Guards against a fast double-click/double-tap submitting twice: react-query's
	// `isPending` only flips after a render, which leaves a window where a second
	// click fires before the submit button re-renders as disabled.
	const isSubmittingRef = useRef(false);

	const guardedSubmit = form.handleSubmit(async (values) => {
		if (isSubmittingRef.current) return;
		isSubmittingRef.current = true;

		try {
			await onSubmit(values);
		} finally {
			isSubmittingRef.current = false;
		}
	});

	return (
		<Form {...form}>
			<form onSubmit={guardedSubmit} className={cn("space-y-8", className)}>
				{children}
			</form>
		</Form>
	);
};

const InputField = ({
	name,
	label,
	type = "text",
	placeholder,
	children,
}: {
	name: string;
	label?: string;
	type?: string;
	placeholder?: string;
	children?: ReactNode;
}) => {
	const { control } = useFormContext();

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label || name}</FormLabel>
					<FormControl>
						{children ? (
							isValidElement(children) ? (
								cloneElement(children, { ...field })
							) : (
								children
							)
						) : (
							<Input
								id={name}
								type={type}
								placeholder={placeholder}
								{...field}
								value={(field.value as string | number | undefined) || ""}
							/>
						)}
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

export { FormBase, InputField };
