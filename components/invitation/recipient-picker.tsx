"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Recipient {
	email: string;
	id: string;
}

interface RecipientPickerProps {
	recipients: Recipient[];
	onRecipientsChange: (recipients: Recipient[]) => void;
	placeholder?: string;
}

export function RecipientPicker({
	recipients,
	onRecipientsChange,
	placeholder = "Type email addresses...",
}: RecipientPickerProps) {
	const [inputValue, setInputValue] = useState("");
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const handleInputChange = (value: string) => {
		setInputValue(value);

		// Simple email validation and suggestions
		// In a real implementation, you could integrate with Google Contacts API here
		if (value.includes("@")) {
			// Could fetch from Google Contacts API if instructor is connected
			// For now, just validate the email format
		}
	};

	const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
			e.preventDefault();
			addRecipient(inputValue.trim());
		} else if (e.key === "Backspace" && inputValue === "" && recipients.length > 0) {
			removeRecipient(recipients[recipients.length - 1].id);
		}
	};

	const addRecipient = (email: string) => {
		if (!email) return;

		// Validate email format
		if (!emailRegex.test(email)) {
			// Could show error toast here
			return;
		}

		// Check for duplicates
		if (recipients.some((r) => r.email.toLowerCase() === email.toLowerCase())) {
			return;
		}

		const newRecipient: Recipient = {
			email,
			id: `${Date.now()}-${Math.random()}`,
		};

		onRecipientsChange([...recipients, newRecipient]);
		setInputValue("");
		setSuggestions([]);
	};

	const removeRecipient = (id: string) => {
		onRecipientsChange(recipients.filter((r) => r.id !== id));
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedText = e.clipboardData.getData("text");
		const emails = pastedText
			.split(/[,\s\n]+/)
			.map((email) => email.trim())
			.filter((email) => emailRegex.test(email));

		const newRecipients: Recipient[] = emails.map((email) => ({
			email,
			id: `${Date.now()}-${Math.random()}-${email}`,
		}));

		// Filter out duplicates
		const uniqueRecipients = newRecipients.filter(
			(newR) => !recipients.some((existing) => existing.email.toLowerCase() === newR.email.toLowerCase())
		);

		onRecipientsChange([...recipients, ...uniqueRecipients]);
		setInputValue("");
	};

	useEffect(() => {
		// Focus input when component mounts or when recipients change
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [recipients.length]);

	return (
		<div
			ref={containerRef}
			className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
			onClick={() => inputRef.current?.focus()}
		>
			<div className="flex flex-wrap gap-2">
				{recipients.map((recipient) => (
					<Badge
						key={recipient.id}
						variant="secondary"
						className="flex items-center gap-1 px-2 py-1"
					>
						<span>{recipient.email}</span>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-4 w-4 p-0 hover:bg-transparent"
							onClick={(e) => {
								e.stopPropagation();
								removeRecipient(recipient.id);
							}}
						>
							<X className="h-3 w-3" />
						</Button>
					</Badge>
				))}
				<Input
					ref={inputRef}
					type="email"
					value={inputValue}
					onChange={(e) => handleInputChange(e.target.value)}
					onKeyDown={handleInputKeyDown}
					onPaste={handlePaste}
					placeholder={recipients.length === 0 ? placeholder : ""}
					className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
				/>
			</div>
			{suggestions.length > 0 && (
				<div className="mt-2 rounded-md border bg-popover p-1">
					{suggestions.map((suggestion, index) => (
						<div
							key={index}
							className="cursor-pointer rounded-sm px-2 py-1 hover:bg-accent"
							onClick={() => {
								addRecipient(suggestion);
							}}
						>
							{suggestion}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

