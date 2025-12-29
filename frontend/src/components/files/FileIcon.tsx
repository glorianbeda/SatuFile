import React from 'react';
import { Box } from '@mui/material';
import {
    Description,
    Image,
    VideoLibrary,
    AudioFile,
    FolderZip,
    Folder,
    PictureAsPdf,
    TableChart,
    Code,
    InsertDriveFile,
} from '@mui/icons-material';

interface FileIconProps {
    type: string;
    extension?: string;
    size?: 'small' | 'medium' | 'large';
}

const iconConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    folder: { icon: <Folder />, color: '#FFAD1F', bg: '#FFAD1F20' },
    document: { icon: <Description />, color: '#1DA1F2', bg: '#1DA1F220' },
    image: { icon: <Image />, color: '#7856FF', bg: '#7856FF20' },
    video: { icon: <VideoLibrary />, color: '#17BF63', bg: '#17BF6320' },
    audio: { icon: <AudioFile />, color: '#E0245E', bg: '#E0245E20' },
    archive: { icon: <FolderZip />, color: '#657786', bg: '#65778620' },
    pdf: { icon: <PictureAsPdf />, color: '#E0245E', bg: '#E0245E20' },
    spreadsheet: { icon: <TableChart />, color: '#17BF63', bg: '#17BF6320' },
    code: { icon: <Code />, color: '#1DA1F2', bg: '#1DA1F220' },
    default: { icon: <InsertDriveFile />, color: '#657786', bg: '#65778620' },
};

const extensionMap: Record<string, string> = {
    // Documents
    doc: 'document', docx: 'document', txt: 'document', rtf: 'document',
    // PDF
    pdf: 'pdf',
    // Spreadsheets
    xls: 'spreadsheet', xlsx: 'spreadsheet', csv: 'spreadsheet',
    // Images
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image',
    // Video
    mp4: 'video', mkv: 'video', avi: 'video', mov: 'video', webm: 'video',
    // Audio
    mp3: 'audio', wav: 'audio', flac: 'audio', ogg: 'audio',
    // Archives
    zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
    // Code
    js: 'code', ts: 'code', jsx: 'code', tsx: 'code', py: 'code', go: 'code',
    html: 'code', css: 'code', json: 'code',
};

const sizeMap = {
    small: { box: 32, icon: 18 },
    medium: { box: 40, icon: 22 },
    large: { box: 48, icon: 26 },
};

export const FileIcon: React.FC<FileIconProps> = ({
    type,
    extension,
    size = 'medium',
}) => {
    let iconType = type;

    if (type === 'file' && extension) {
        const ext = extension.toLowerCase().replace('.', '');
        iconType = extensionMap[ext] || 'default';
    }

    const config = iconConfig[iconType] || iconConfig.default;
    const dimensions = sizeMap[size];

    return (
        <Box
            sx={{
                width: dimensions.box,
                height: dimensions.box,
                borderRadius: 2,
                bgcolor: config.bg,
                color: config.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& svg': {
                    fontSize: dimensions.icon,
                },
            }}
        >
            {config.icon}
        </Box>
    );
};

export default FileIcon;
