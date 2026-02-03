import React, { useState, useEffect } from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	Alert,
	CircularProgress,
} from "@mui/material";
import { Button } from "../../../components/common";
import { api } from "../../../api";

interface DriveInfo {
	device: string;
	mount: string;
	filesystem: string;
	size_gb: number;
	used_gb: number;
	available_gb: number;
	usage_percent: number;
	read_only: boolean;
}

interface DriveSelectionStepProps {
	onSelect: (drive: string) => void;
	onBack: () => void;
}

export const DriveSelectionStep: React.FC<DriveSelectionStepProps> = ({
	onSelect,
	onBack,
}) => {
	const [drives, setDrives] = useState<DriveInfo[]>([]);
	const [selectedDrive, setSelectedDrive] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		loadDrives();
	}, []);

	const loadDrives = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await api.get<DriveInfo[]>("/setup/drives");
			setDrives(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load drives");
		} finally {
			setLoading(false);
		}
	};

	const handleSelect = (drive: string) => {
		setSelectedDrive(drive);
	};

	const handleContinue = () => {
		if (selectedDrive) {
			onSelect(selectedDrive);
		}
	};

	const formatSize = (gb: number) => {
		if (gb >= 1000) {
			return `${(gb / 1024).toFixed(1)} TB`;
		}
		return `${gb.toFixed(1)} GB`;
	};

	return (
		<Card>
			<CardContent sx={{ p: 4 }}>
				<Typography variant="h5" gutterBottom fontWeight="bold">
					Select Storage Drive
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Choose the drive where you want to create your cloud storage partition.
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
						<CircularProgress />
					</Box>
				) : (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						{drives.map((drive) => (
							<DriveCard
								key={drive.mount}
								drive={drive}
								selected={selectedDrive === drive.mount}
								onSelect={() => handleSelect(drive.mount)}
								formatSize={formatSize}
							/>
						))}
					</Box>
				)}

				<Box sx={{ display: "flex", gap: 2, mt: 3 }}>
					<Button
						onClick={onBack}
						variant="outlined"
						sx={{ flex: 1 }}
						disabled={loading}
					>
						Back
					</Button>
					<Button
						onClick={handleContinue}
						variant="contained"
						sx={{ flex: 1 }}
						disabled={!selectedDrive || loading}
					>
						Continue
					</Button>
				</Box>
			</CardContent>
		</Card>
	);
};

interface DriveCardProps {
	drive: DriveInfo;
	selected: boolean;
	onSelect: () => void;
	formatSize: (gb: number) => string;
}

const DriveCard: React.FC<DriveCardProps> = ({
	drive,
	selected,
	onSelect,
	formatSize,
}) => {
	const usageColor = drive.usage_percent > 90 ? "error" : drive.usage_percent > 70 ? "warning" : "success";

	return (
		<Box
			onClick={onSelect}
			sx={{
				p: 2,
				border: 2,
				borderColor: selected ? "primary.main" : "divider",
				borderRadius: 2,
				cursor: "pointer",
				transition: "all 0.2s",
				"&:hover": {
					borderColor: selected ? "primary.main" : "primary.light",
					bgcolor: "action.hover",
				},
				bgcolor: selected ? "primary.50" : "background.paper",
			}}
		>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
				<Typography variant="subtitle1" fontWeight="bold">
					{drive.mount === "/" ? "Root Drive" : drive.mount}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{formatSize(drive.size_gb)} total
				</Typography>
			</Box>

			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
				<Typography variant="body2" color="text.secondary">
					{drive.device}
				</Typography>
				<Typography variant="body2" color={usageColor + ".main"} fontWeight="medium">
					{drive.usage_percent.toFixed(0)}% used
				</Typography>
			</Box>

			<Box
				sx={{
					width: "100%",
					height: 8,
					bgcolor: "divider",
					borderRadius: 1,
					overflow: "hidden",
				}}
			>
				<Box
					sx={{
						width: `${drive.usage_percent}%`,
						height: "100%",
						bgcolor: `${usageColor}.main`,
					}}
				/>
			</Box>

			<Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
				{formatSize(drive.used_gb)} used • {formatSize(drive.available_gb)} available
			</Typography>
		</Box>
	);
};
