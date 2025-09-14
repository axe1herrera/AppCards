import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  AppBar,
  Toolbar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Folder as FolderIcon,
  Home as HomeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { blue, purple } from '@mui/material/colors';

// Configuración de Material Design 3
const theme = createTheme({
  palette: {
    primary: {
      main: blue[700],
    },
    secondary: {
      main: purple[500],
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

// Componente principal
function App() {
  const [cards, setCards] = useState([]);
  const [folders, setFolders] = useState(['General']);
  const [decks, setDecks] = useState({ General: ['Default'] });

  const [currentFolder, setCurrentFolder] = useState('General');
  const [currentDeck, setCurrentDeck] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isDeckDialogOpen, setIsDeckDialogOpen] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);

  const [newFolderName, setNewFolderName] = useState('');
  const [newDeckName, setNewDeckName] = useState('');
  const [newCard, setNewCard] = useState({ front: '', back: '' });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Cargar datos del localStorage
  useEffect(() => {
    const savedCards = localStorage.getItem('englishCards');
    const savedFolders = localStorage.getItem('cardFolders');
    const savedDecks = localStorage.getItem('cardDecks');

    if (savedCards) setCards(JSON.parse(savedCards));
    if (savedFolders) setFolders(JSON.parse(savedFolders));
    if (savedDecks) setDecks(JSON.parse(savedDecks));
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('englishCards', JSON.stringify(cards));
    localStorage.setItem('cardFolders', JSON.stringify(folders));
    localStorage.setItem('cardDecks', JSON.stringify(decks));
  }, [cards, folders, decks]);

  // Crear carpeta
  const handleAddFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName)) {
      setFolders([...folders, newFolderName]);
      setDecks({ ...decks, [newFolderName]: ['Default'] });
      setNewFolderName('');
      setIsFolderDialogOpen(false);
    }
  };

  // Crear mazo
  const handleAddDeck = () => {
    if (newDeckName.trim() && !decks[currentFolder]?.includes(newDeckName)) {
      setDecks({
        ...decks,
        [currentFolder]: [...(decks[currentFolder] || []), newDeckName],
      });
      setNewDeckName('');
      setIsDeckDialogOpen(false);
    }
  };

  // Crear tarjeta
  const handleAddCard = () => {
    if (newCard.front.trim() && newCard.back.trim() && currentDeck) {
      setCards([...cards, { ...newCard, folder: currentFolder, deck: currentDeck, id: Date.now() }]);
      setNewCard({ front: '', back: '' });
      setIsDialogOpen(false);
    }
  };

  // Filtrar tarjetas del mazo actual
  const filteredCards = cards.filter(
    (c) => c.folder === currentFolder && c.deck === currentDeck
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        {/* AppBar */}
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <HomeIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Flashcards
            </Typography>
            <Button
              color="inherit"
              startIcon={<CreateNewFolderIcon />}
              onClick={() => setIsFolderDialogOpen(true)}
            >
              Nueva Carpeta
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', p: 2, gap: 2 }}>
          {/* Panel de Carpetas */}
          <Card sx={{ minWidth: 250 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Carpetas
              </Typography>
              <List>
                {folders.map((folder) => (
                  <ListItem
                    key={folder}
                    button
                    selected={folder === currentFolder}
                    onClick={() => {
                      setCurrentFolder(folder);
                      setCurrentDeck(null);
                    }}
                  >
                    <ListItemIcon>
                      <FolderIcon color={folder === currentFolder ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary={folder} />
                    <Chip
                      size="small"
                      label={cards.filter((c) => c.folder === folder).length}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Área principal: lista de mazos */}
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">{currentFolder} - Mazos</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsDeckDialogOpen(true)}
              >
                Nuevo Mazo
              </Button>
            </Box>

            {(decks[currentFolder] || []).length === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  No hay mazos en esta carpeta
                </Typography>
              </Card>
            ) : (
              <List>
                {decks[currentFolder].map((deck) => (
                  <ListItem
                    key={deck}
                    button
                    onClick={() => {
                      setCurrentDeck(deck);
                      setCurrentIndex(0);
                      setIsStudyMode(true);
                    }}
                  >
                    <ListItemText primary={deck} />
                    <Chip
                      size="small"
                      label={cards.filter(
                        (c) => c.folder === currentFolder && c.deck === deck
                      ).length}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>

        {/* Dialog para agregar nueva tarjeta */}
        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nueva Flashcard</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Palabra en inglés o concepto"
              fullWidth
              variant="outlined"
              value={newCard.front}
              onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Traducción o significado"
              fullWidth
              variant="outlined"
              value={newCard.back}
              onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleAddCard}
              variant="contained"
              disabled={!newCard.front.trim() || !newCard.back.trim()}
            >
              Agregar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para agregar nueva carpeta */}
        <Dialog open={isFolderDialogOpen} onClose={() => setIsFolderDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nueva Carpeta</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre de la carpeta"
              fullWidth
              variant="outlined"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsFolderDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleAddFolder}
              variant="contained"
              disabled={!newFolderName.trim() || folders.includes(newFolderName)}
            >
              Crear Carpeta
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para agregar nuevo mazo */}
        <Dialog open={isDeckDialogOpen} onClose={() => setIsDeckDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nuevo Mazo</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre del mazo"
              fullWidth
              variant="outlined"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeckDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleAddDeck}
              variant="contained"
              disabled={!newDeckName.trim() || decks[currentFolder]?.includes(newDeckName)}
            >
              Crear Mazo
            </Button>
          </DialogActions>
        </Dialog>

        {/* Visor fullscreen de estudio */}
        <Dialog fullScreen open={isStudyMode} onClose={() => setIsStudyMode(false)}>
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={() => setIsStudyMode(false)}>
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
                Estudiando: {currentDeck}
              </Typography>
              <Button
                color="inherit"
                onClick={() => setIsDialogOpen(true)}
              >
                Nueva Tarjeta
              </Button>
            </Toolbar>
          </AppBar>

          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {filteredCards.length > 0 ? (
                <Flashcard card={filteredCards[currentIndex]} />
              ) : (
                <Typography>No hay tarjetas en este mazo</Typography>
              )}
            </Box>
            {filteredCards.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentIndex((i) => Math.min(i + 1, filteredCards.length - 1))}
                >
                  Siguiente
                </Button>
              </Box>
            )}
          </Box>
        </Dialog>

        {/* Botón flotante para agregar tarjetas (solo visible si hay mazo seleccionado) */}
        {currentDeck && (
          <Fab
            color="primary"
            aria-label="add"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => setIsDialogOpen(true)}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
    </ThemeProvider>
  );
}

// Componente de flashcard
function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Box
      sx={{
        perspective: '1000px',
        cursor: 'pointer',
        width: 400,
        height: 250,
      }}
      onClick={handleFlip}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Frente */}
        <Card
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <CardContent>
            <Typography variant="h4" align="center">
              {card.front}
            </Typography>
            <Typography variant="body2" align="center" sx={{ mt: 1, opacity: 0.8 }}>
              Haz clic para ver la traducción
            </Typography>
          </CardContent>
        </Card>

        {/* Reverso */}
        <Card
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotateY(180deg)',
            bgcolor: 'secondary.main',
            color: 'white',
          }}
        >
          <CardContent>
            <Typography variant="h4" align="center">
              {card.back}
            </Typography>
            <Typography variant="body2" align="center" sx={{ mt: 1, opacity: 0.8 }}>
              Haz clic para volver
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default App;

