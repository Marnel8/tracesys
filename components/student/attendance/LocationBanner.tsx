"use client";

import { AlertCircle, MapPin } from "lucide-react";
import { memo } from "react";

type Props = {
	locationError: string | null;
	locationDetected: boolean;
};

const LocationBanner = ({ locationError, locationDetected }: Props) => {
	return (
		<>
			{locationError && (
				<div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg">
					<div className="flex items-center gap-2 text-red-600">
						<AlertCircle className="w-4 h-4 flex-shrink-0" />
						<span className="text-xs sm:text-sm font-medium">
							Location Required
						</span>
					</div>
					<p className="text-xs sm:text-sm text-red-600 mt-1 leading-relaxed">
						{locationError}
					</p>
				</div>
			)}

			{locationDetected && (
				<div className="bg-green-50 border border-green-200 p-3 sm:p-4 rounded-lg">
					<div className="flex items-center gap-2 text-green-600">
						<MapPin className="w-4 h-4 flex-shrink-0" />
						<span className="text-xs sm:text-sm font-medium">
							Location Detected
						</span>
					</div>
					<p className="text-xs sm:text-sm text-green-600 mt-1 leading-relaxed">
						Ready to track attendance
					</p>
				</div>
			)}
		</>
	);
};

export default memo(LocationBanner);
