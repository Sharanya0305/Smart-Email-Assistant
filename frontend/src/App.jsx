import { useState } from 'react';
import './App.css';
import {
  Box, Button, CircularProgress, Container, FormControl,
  InputLabel, MenuItem, Select, TextField, Typography, Card, CardContent
} from '@mui/material';
import axios from 'axios';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReplies, setGeneratedReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!emailContent.trim()) return;
    setLoading(true);
    setError('');
    setGeneratedReplies([]); // ✅ Clear old replies before new generation

    try {
      const response = await axios.post("http://localhost:8080/api/email/generate", {
        emailContent,
        tone
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data = response.data;
      const replies = Array.isArray(data)
        ? data.map(r => r.replace(/\[Your Name\]/g, 'Sharanya'))
        : [String(data).replace(/\[Your Name\]/g, 'Sharanya')];

      setGeneratedReplies([...replies]); // ✅ Force React to re-render with new data
      console.log("Replies received:", replies);
    } catch (error) {
      console.error('Axios error:', error.response?.data || error.message);
      setError('Failed to generate email reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      alert('Reply copied to clipboard!');
    } else {
      alert('No content to copy.');
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 5,
        background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        borderRadius: 5,
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        my: 5,
        p: 4
      }}
    >
      <Typography
        variant='h3'
        component="h1"
        gutterBottom
        align='center'
        sx={{
          fontWeight: 700,
          color: '#4a148c',
          textShadow: '2px 2px 6px rgba(0,0,0,0.1)',
          mb: 3
        }}
      >
        Smart Email Reply Generator
      </Typography>

      <Typography align="center" sx={{ mb: 4, color: '#333' }}>
        ✉️ Generate professional, friendly, or casual replies instantly with Gemini AI.
      </Typography>

      <Box sx={{ mx: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant='outlined'
          label="Enter your received email content"
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{
            mb: 3,
            backgroundColor: '#fff',
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            }
          }}
        />

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Tone</InputLabel>
          <Select
            value={tone}
            label="Tone"
            onChange={(e) => setTone(e.target.value)}
            sx={{
              backgroundColor: '#fff',
              borderRadius: 2
            }}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="friendly">Friendly</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={!emailContent || loading}
          fullWidth
          sx={{
            background: 'linear-gradient(90deg, #7b2ff7, #f107a3)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1rem',
            borderRadius: '12px',
            py: 1.5,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            '&:hover': {
              background: 'linear-gradient(90deg, #f107a3, #7b2ff7)',
              transform: 'scale(1.02)',
              boxShadow: '0 6px 14px rgba(0,0,0,0.25)'
            }
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "✨ Generate Reply"}
        </Button>
      </Box>

      {error && (
        <Typography color='error' sx={{ mt: 3, textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      {generatedReplies.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography
            variant='h5'
            gutterBottom
            align='center'
            sx={{
              fontWeight: 'bold',
              color: '#6a1b9a',
              mb: 3
            }}
          >
            💬 Generated Replies
          </Typography>

          {generatedReplies.map((reply, index) => (
            <Card
              key={index}
              sx={{
                background: 'linear-gradient(to bottom right, #fceabb, #f8b500)',
                borderRadius: 3,
                boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
                mb: 3,
                transition: '0.3s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                }
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    whiteSpace: 'pre-line',
                    fontSize: '1rem',
                    color: '#333',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  {reply || "No content generated."}
                </Typography>

                <Button
                  variant='outlined'
                  sx={{
                    mt: 2,
                    borderColor: '#4a148c',
                    color: '#4a148c',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    '&:hover': {
                      background: '#4a148c',
                      color: 'white'
                    }
                  }}
                  onClick={() => copyToClipboard(reply)}
                >
                  Copy to Clipboard
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default App;
