"use client";

import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut } from "lucide-react";
import { memo } from "react";

type Props = {
	onClockIn: () => void;
	onClockOut: () => void;
	disableClockIn: boolean;
	disableClockOut: boolean;
	isClockingOut: boolean;
};

const ClockButtons = ({
	onClockIn,
	onClockOut,
	disableClockIn,
	disableClockOut,
	isClockingOut,
}: Props) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
			<Button
				onClick={onClockIn}
				disabled={disableClockIn}
				className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm h-10 sm:h-11"
			>
				<LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
				Clock In
			</Button>

			<Button
				onClick={onClockOut}
				disabled={disableClockOut}
				className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm h-10 sm:h-11"
			>
				{isClockingOut ? (
					<>
						<Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
						Clocking Out...
					</>
				) : (
					<>
						<LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
						Clock Out
					</>
				)}
			</Button>
		</div>
	);
};

export default memo(ClockButtons);
