import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Paper,
    IconButton,
} from '@mui/material';
import { ArrowBack, Person, Security } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ProfileSettings from '../components/ProfileSettings';
import SecuritySettings from '../components/SecuritySettings';


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <div hidden={value !== index} role="tabpanel">
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
};

export const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);

    const handleBack = () => {
        navigate('/');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                py: 4,
            }}
        >
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <IconButton onClick={handleBack}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold">
                        Pengaturan
                    </Typography>
                </Box>

                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>


                    <>
                        <Tabs
                            value={tabValue}
                            onChange={(_, newValue) => setTabValue(newValue)}
                            variant="fullWidth"
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                            }}
                        >
                            <Tab
                                icon={<Person />}
                                iconPosition="start"
                                label="Profil"
                                sx={{ py: 2 }}
                            />
                            <Tab
                                icon={<Security />}
                                iconPosition="start"
                                label="Keamanan"
                                sx={{ py: 2 }}
                            />
                        </Tabs>

                        <Box sx={{ p: 3 }}>
                            <TabPanel value={tabValue} index={0}>
                                <ProfileSettings />
                            </TabPanel>
                            <TabPanel value={tabValue} index={1}>
                                <SecuritySettings />
                            </TabPanel>
                        </Box>
                    </>


                </Paper>
            </Container>
        </Box>
    );
};

export default SettingsPage;
