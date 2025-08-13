"use client";

import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";
import { memo } from "react";

type Location = {
	latitude: number;
	longitude: number;
	address?: string;
} | null;

type Props = {
	location: Location;
	isLoadingAddress: boolean;
	isMounted: boolean;
	currentTime: string;
	onRefresh: () => void;
};

const CurrentLocationDisplay = ({
	location,
	isLoadingAddress,
	isMounted,
	currentTime,
	onRefresh,
}: Props) => {
	return (
		<div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
				<div className="flex items-center gap-2">
					<MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
					<span className="text-xs sm:text-sm font-medium">
						Current Location
					</span>
				</div>
				<div className="flex items-center justify-between sm:gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={onRefresh}
						disabled={isLoadingAddress}
						className="h-7 sm:h-8 px-2 text-xs hover:bg-gray-200"
					>
						<MapPin className="w-3 h-3 mr-1" />
						Refresh
					</Button>
					<div className="flex items-center gap-2">
						<Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
						<span className="text-xs sm:text-sm font-mono">
							{isMounted ? currentTime : "--:--:--"}
						</span>
					</div>
				</div>
			</div>

			{location && (
				<div className="space-y-2">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
						<span className="text-xs text-gray-600">Coordinates:</span>
						<span className="font-mono text-xs text-gray-800 break-all">
							{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
						</span>
					</div>

					{location.address && (
						<div className="space-y-1">
							<span className="text-xs text-gray-600">Address:</span>
							<p className="text-xs text-gray-800 leading-relaxed break-words">
								{location.address}
							</p>
						</div>
					)}

					{isLoadingAddress && (
						<div className="flex items-center gap-2 text-xs text-gray-500">
							<Clock className="w-3 h-3 animate-spin" />
							<span>Getting address...</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default memo(CurrentLocationDisplay);
