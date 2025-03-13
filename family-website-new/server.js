const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

// הגדרות CORS מורחבות
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.5.88:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// לוג לכל בקשה
app.use((req, res, next) => {
  console.log('קיבלתי בקשה:', {
    method: req.method,
    url: req.url,
    body: req.body
  });
  next();
});

// הגדרת headers נוספים
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// בדיקה שהשרת חי
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// הגדרת תיקיית האחסון לתמונות
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// הגדרת תיקיית האחסון לסרטונים
const videosDir = path.join(__dirname, 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir);
}

// הגדרת multer לשמירת קבצים
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('קובץ התקבל בשרת:', file);
    console.log('שדה הקובץ:', file.fieldname);
    
    // בדיקה אם זה סרטון או תמונה
    if (file.fieldname === 'video') {
      // וידוא שהתיקייה קיימת
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }
      cb(null, videosDir);
    } else {
      // וידוא שהתיקייה קיימת
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // הגדלה ל-50MB
  }
});

// קובץ JSON לשמירת נתוני המשפחה
const familyDataFile = path.join(__dirname, 'family-data.json');

// קובץ JSON לשמירת נתוני המתכונים
const recipesDataFile = path.join(__dirname, 'recipes-data.json');

// קובץ JSON לשמירת נתוני הסרטונים
const videosDataFile = path.join(__dirname, 'videos-data.json');

// קובץ JSON לשמירת נתוני האירועים
const eventsDataFile = path.join(__dirname, 'events-data.json');

// קובץ JSON לשמירת נתוני היצירות
const creationsDataFile = path.join(__dirname, 'creations-data.json');

// טעינת נתוני המשפחה
const loadFamilyData = () => {
  if (fs.existsSync(familyDataFile)) {
    return JSON.parse(fs.readFileSync(familyDataFile, 'utf8'));
  }
  return [
    { id: 1, name: 'אבא', emoji: '👨', photos: [] },
    { id: 2, name: 'אמא', emoji: '👩', photos: [] },
    { id: 3, name: 'אלירן', emoji: '👦', photos: [] },
    { id: 4, name: 'עילי', emoji: '👦', photos: [] },
    { id: 5, name: 'שיראן', emoji: '👦', photos: [] },
    { id: 6, name: 'ליעוז', emoji: '👦', photos: [] },
    { id: 7, name: 'משפחה', emoji: '👨‍👩‍👦‍👦', photos: [] }
  ];
};

// טעינת נתוני המתכונים
const loadRecipesData = () => {
  if (fs.existsSync(recipesDataFile)) {
    return JSON.parse(fs.readFileSync(recipesDataFile, 'utf8'));
  }
  return [];
};

// טעינת נתוני הסרטונים
const loadVideosData = () => {
  try {
    // בדיקה אם קובץ הסרטונים קיים
    if (fs.existsSync(videosDataFile)) {
      try {
        // קריאת תוכן הקובץ
        const fileContent = fs.readFileSync(videosDataFile, 'utf8');
        
        // בדיקה אם הקובץ ריק
        if (!fileContent || fileContent.trim() === '') {
          console.log('קובץ נתוני הסרטונים ריק, מחזיר נתוני ברירת מחדל');
          const defaultData = getDefaultVideosData();
          fs.writeFileSync(videosDataFile, JSON.stringify(defaultData, null, 2));
          return defaultData;
        }
        
        try {
          // ניסיון לפרסר את ה-JSON
          return JSON.parse(fileContent);
        } catch (e) {
          console.error('שגיאה בניתוח קובץ JSON של הסרטונים:', e);
          // במקרה של שגיאה בניתוח, יוצר קובץ חדש עם נתוני ברירת מחדל
          const defaultData = getDefaultVideosData();
          fs.writeFileSync(videosDataFile, JSON.stringify(defaultData, null, 2));
          return defaultData;
        }
      } catch (e) {
        console.error('שגיאה בקריאת קובץ הסרטונים:', e);
        const defaultData = getDefaultVideosData();
        fs.writeFileSync(videosDataFile, JSON.stringify(defaultData, null, 2));
        return defaultData;
      }
    } else {
      // אם הקובץ לא קיים, יוצר קובץ חדש עם נתוני ברירת מחדל
      console.log('קובץ נתוני הסרטונים לא קיים, יוצר קובץ חדש');
      const defaultData = getDefaultVideosData();
      fs.writeFileSync(videosDataFile, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
  } catch (error) {
    console.error('שגיאה בטעינת נתוני הסרטונים:', error);
    return getDefaultVideosData();
  }
};

// נתוני ברירת מחדל לסרטונים
const getDefaultVideosData = () => {
  return [
    { id: 1, name: 'אבא', emoji: '👨', videos: [] },
    { id: 2, name: 'אמא', emoji: '👩', videos: [] },
    { id: 3, name: 'אלירן', emoji: '👦', videos: [] },
    { id: 4, name: 'עילי', emoji: '👦', videos: [] },
    { id: 5, name: 'שיראן', emoji: '👦', videos: [] },
    { id: 6, name: 'ליעוז', emoji: '👦', videos: [] },
    { id: 7, name: 'משפחה', emoji: '👨‍👩‍👦‍👦', videos: [] }
  ];
};

// שמירת נתוני המשפחה
const saveFamilyData = (data) => {
  fs.writeFileSync(familyDataFile, JSON.stringify(data, null, 2));
};

// שמירת נתוני המתכונים
const saveRecipesData = (data) => {
  fs.writeFileSync(recipesDataFile, JSON.stringify(data, null, 2));
};

// שמירת נתוני הסרטונים
const saveVideosData = (data) => {
  try {
    // וידוא שהתיקייה קיימת
    const dir = path.dirname(videosDataFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // שמירת הנתונים
    fs.writeFileSync(videosDataFile, JSON.stringify(data, null, 2));
    console.log('נתוני הסרטונים נשמרו בהצלחה');
  } catch (error) {
    console.error('שגיאה בשמירת נתוני הסרטונים:', error);
    throw error; // העברת השגיאה הלאה
  }
};

// טעינת נתוני האירועים
const loadEventsData = () => {
  try {
    if (fs.existsSync(eventsDataFile)) {
      const data = fs.readFileSync(eventsDataFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading events data:', error);
    return [];
  }
};

// שמירת נתוני האירועים
const saveEventsData = (data) => {
  try {
    fs.writeFileSync(eventsDataFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving events data:', error);
    throw error;
  }
};

// טעינת נתוני היצירות
const loadCreationsData = () => {
  if (fs.existsSync(creationsDataFile)) {
    return JSON.parse(fs.readFileSync(creationsDataFile, 'utf8'));
  }
  return {
    '3d': [],
    'lego': [],
    'drawings': [],
    'technoda': []
  };
};

// שמירת נתוני היצירות
const saveCreationsData = (data) => {
  fs.writeFileSync(creationsDataFile, JSON.stringify(data, null, 2));
};

// נתיב סטטי לתמונות
app.use('/uploads', express.static(uploadDir));

// נתיב סטטי לסרטונים
app.use('/videos', express.static(videosDir));

// קבלת כל בני המשפחה
app.get('/family-members', (req, res) => {
  try {
    const data = loadFamilyData();
    res.json(data);
  } catch (error) {
    console.error('Error loading family data:', error);
    res.status(500).json({ error: 'Failed to load family data' });
  }
});

// קבלת כל המתכונים
app.get('/recipes', (req, res) => {
  try {
    console.log('מקבל בקשה לקבלת כל המתכונים');
    
    // בדיקה אם קובץ המתכונים קיים
    if (!fs.existsSync(recipesDataFile)) {
      console.log('קובץ המתכונים לא קיים, יוצר קובץ חדש');
      fs.writeFileSync(recipesDataFile, JSON.stringify([], null, 2));
    }
    
    const data = loadRecipesData();
    console.log('מחזיר מתכונים:', data);
    res.json(data);
  } catch (error) {
    console.error('שגיאה בטעינת נתוני המתכונים:', error);
    res.status(500).json({ error: 'Failed to load recipes data' });
  }
});

// קבלת כל בני המשפחה עם הסרטונים
app.get('/family-members-videos', (req, res) => {
  try {
    console.log('מקבל בקשה לקבלת כל בני המשפחה עם הסרטונים');
    
    // בדיקה אם קובץ הסרטונים קיים
    if (!fs.existsSync(videosDataFile)) {
      console.log('קובץ הסרטונים לא קיים, יוצר קובץ חדש');
      fs.writeFileSync(videosDataFile, JSON.stringify(loadVideosData(), null, 2));
    }
    
    const data = loadVideosData();
    console.log('מחזיר נתוני סרטונים:', data);
    res.json(data);
  } catch (error) {
    console.error('שגיאה בטעינת נתוני הסרטונים:', error);
    res.status(500).json({ error: 'Failed to load videos data' });
  }
});

// הוספת מתכון חדש
app.post('/add-recipe', (req, res) => {
  try {
    console.log('מקבל בקשה להוספת מתכון חדש:', req.body);
    
    const { name, url, content, type } = req.body;
    
    if (!name) {
      console.log('חסר שם מתכון');
      return res.status(400).json({ error: 'Recipe name is required' });
    }

    if (type === 'url' && !url) {
      console.log('חסר URL למתכון');
      return res.status(400).json({ error: 'URL is required for URL type recipes' });
    }

    if (type === 'content' && !content) {
      console.log('חסר תוכן למתכון');
      return res.status(400).json({ error: 'Content is required for content type recipes' });
    }
    
    // בדיקה אם קובץ המתכונים קיים
    if (!fs.existsSync(recipesDataFile)) {
      console.log('קובץ המתכונים לא קיים, יוצר קובץ חדש');
      fs.writeFileSync(recipesDataFile, JSON.stringify([], null, 2));
    }
    
    const recipes = loadRecipesData();
    
    const newRecipe = {
      id: Date.now(),
      name,
      url: url || '',
      content: content || '',
      type: type || 'url',
      timestamp: Date.now()
    };
    
    recipes.push(newRecipe);
    saveRecipesData(recipes);
    
    console.log('מתכון נשמר בהצלחה:', newRecipe);
    res.json(newRecipe);
  } catch (error) {
    console.error('שגיאה בהוספת מתכון:', error);
    res.status(500).json({ error: 'Failed to add recipe' });
  }
});

// העלאת תמונה
app.post('/upload-photo', upload.single('image'), (req, res) => {
  try {
    console.log('קבלת בקשת העלאה');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    if (!req.file) {
      console.log('לא התקבל קובץ');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('קובץ התקבל:', req.file);
    console.log('מזהה בן משפחה:', req.body.memberId);

    // בדיקה שהתיקייה קיימת
    if (!fs.existsSync(uploadDir)) {
      console.log('תיקיית התמונות לא קיימת, יוצר תיקייה חדשה');
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const memberId = parseInt(req.body.memberId);
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // בדיקה שקובץ הנתונים קיים
    if (!fs.existsSync(familyDataFile)) {
      console.log('קובץ נתוני המשפחה לא קיים, יוצר קובץ חדש');
      fs.writeFileSync(familyDataFile, JSON.stringify(loadFamilyData(), null, 2));
    }
    
    const data = loadFamilyData();
    console.log('נתוני משפחה נטענו:', data);
    
    const member = data.find(m => m.id === memberId);
    
    if (!member) {
      console.log('בן משפחה לא נמצא:', memberId);
      // מחיקת הקובץ אם בן המשפחה לא נמצא
      fs.unlinkSync(path.join(__dirname, imageUrl));
      return res.status(404).json({ error: 'Member not found' });
    }

    const photoData = {
      url: imageUrl,
      name: req.file.originalname,
      timestamp: Date.now()
    };

    // וידוא שמערך התמונות קיים
    if (!member.photos) {
      member.photos = [];
    }

    member.photos.push(photoData);
    saveFamilyData(data);

    console.log('תמונה נשמרה בהצלחה:', photoData);
    res.json(photoData);
  } catch (error) {
    console.error('Error uploading photo:', error);
    // ניסיון למחוק את הקובץ במקרה של שגיאה
    if (req.file) {
      try {
        fs.unlinkSync(path.join(__dirname, `/uploads/${req.file.filename}`));
      } catch (e) {
        console.error('Error deleting file after failed upload:', e);
      }
    }
    res.status(500).json({ error: 'Failed to upload photo', details: error.message });
  }
});

// מחיקת תמונה
app.delete('/delete-photo', (req, res) => {
  try {
    const { memberId, photoIndex } = req.body;
    const data = loadFamilyData();
    const member = data.find(m => m.id === memberId);

    if (!member || photoIndex >= member.photos.length) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const photo = member.photos[photoIndex];
    const filePath = path.join(__dirname, photo.url);

    // מחיקת הקובץ מהדיסק
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // מחיקת התמונה מהמערך
    member.photos.splice(photoIndex, 1);
    saveFamilyData(data);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// מחיקת מתכון
app.delete('/delete-recipe/:id', (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const recipes = loadRecipesData();
    
    const recipeIndex = recipes.findIndex(r => r.id === recipeId);
    
    if (recipeIndex === -1) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    recipes.splice(recipeIndex, 1);
    saveRecipesData(recipes);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// העלאת סרטון
app.post('/upload-video', upload.single('video'), (req, res) => {
  try {
    console.log('קבלת בקשת העלאת סרטון');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    if (!req.file) {
      console.log('לא התקבל קובץ');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('קובץ התקבל:', req.file);
    console.log('מזהה בן משפחה:', req.body.memberId);

    // בדיקה שהתיקייה קיימת
    if (!fs.existsSync(videosDir)) {
      console.log('תיקיית הסרטונים לא קיימת, יוצר תיקייה חדשה');
      fs.mkdirSync(videosDir, { recursive: true });
    }

    const memberId = parseInt(req.body.memberId);
    const videoUrl = `/videos/${req.file.filename}`;
    
    // טעינת נתוני הסרטונים
    const data = loadVideosData();
    console.log('נתוני סרטונים נטענו:', data);
    
    // חיפוש בן המשפחה
    const member = data.find(m => m.id === memberId);
    
    if (!member) {
      console.log('בן משפחה לא נמצא:', memberId);
      // מחיקת הקובץ אם בן המשפחה לא נמצא
      try {
        fs.unlinkSync(path.join(__dirname, videoUrl));
      } catch (e) {
        console.error('שגיאה במחיקת קובץ:', e);
      }
      return res.status(404).json({ error: 'Member not found' });
    }

    const videoData = {
      url: videoUrl,
      name: req.file.originalname,
      timestamp: Date.now()
    };

    // וידוא שמערך הסרטונים קיים
    if (!member.videos) {
      member.videos = [];
    }

    member.videos.push(videoData);
    
    // שמירת הנתונים
    try {
      saveVideosData(data);
      console.log('סרטון נשמר בהצלחה:', videoData);
      res.json(videoData);
    } catch (error) {
      console.error('שגיאה בשמירת נתוני הסרטונים:', error);
      // ניסיון למחוק את הקובץ במקרה של שגיאה
      try {
        fs.unlinkSync(path.join(__dirname, videoUrl));
      } catch (e) {
        console.error('שגיאה במחיקת קובץ לאחר כישלון בשמירה:', e);
      }
      res.status(500).json({ error: 'Failed to save video data', details: error.message });
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    // ניסיון למחוק את הקובץ במקרה של שגיאה
    if (req.file) {
      try {
        fs.unlinkSync(path.join(__dirname, `/videos/${req.file.filename}`));
      } catch (e) {
        console.error('Error deleting file after failed upload:', e);
      }
    }
    res.status(500).json({ error: 'Failed to upload video', details: error.message });
  }
});

// מחיקת סרטון לפי URL
app.delete('/delete-video-by-url', (req, res) => {
  try {
    const { memberId, videoUrl } = req.body;
    console.log('בקשת מחיקת סרטון לפי URL:', memberId, videoUrl);
    
    const data = loadVideosData();
    const member = data.find(m => m.id === memberId);

    if (!member) {
      console.error('בן משפחה לא נמצא:', memberId);
      return res.status(404).json({ error: 'Member not found' });
    }

    // מציאת הסרטון לפי URL
    const videoIndex = member.videos.findIndex(v => v.url === videoUrl);
    
    if (videoIndex === -1) {
      console.error('סרטון לא נמצא:', videoUrl);
      console.log('URLs של הסרטונים הקיימים:', member.videos.map(v => v.url));
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = member.videos[videoIndex];
    console.log('נמצא סרטון למחיקה:', video);
    
    const filePath = path.join(__dirname, video.url);
    console.log('נתיב קובץ למחיקה:', filePath);

    // מחיקת הקובץ מהדיסק
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('הקובץ נמחק מהדיסק בהצלחה');
    } else {
      console.warn('הקובץ לא נמצא בדיסק:', filePath);
    }

    // מחיקת הסרטון מהמערך
    member.videos.splice(videoIndex, 1);
    saveVideosData(data);
    console.log('הסרטון נמחק מהנתונים בהצלחה');

    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video by URL:', error);
    res.status(500).json({ error: 'Failed to delete video', details: error.message });
  }
});

// קבלת כל האירועים
app.get('/api/events', (req, res) => {
  try {
    const events = loadEventsData();
    res.json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// קבלת אירוע בודד
app.get('/api/events/:id', (req, res) => {
  try {
    const events = loadEventsData();
    const event = events.find(e => e.id.toString() === req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// עדכון אירוע
app.put('/api/events/:id', (req, res) => {
  try {
    const events = loadEventsData();
    const eventIndex = events.findIndex(e => e.id.toString() === req.params.id);
    
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const updatedEvent = {
      ...events[eventIndex],
      ...req.body,
      id: events[eventIndex].id // שמירה על ה-ID המקורי
    };

    events[eventIndex] = updatedEvent;
    saveEventsData(events);
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// מחיקת אירוע
app.delete('/api/events/:id', (req, res) => {
  try {
    const events = loadEventsData();
    const eventIndex = events.findIndex(e => e.id.toString() === req.params.id);
    
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    events.splice(eventIndex, 1);
    saveEventsData(events);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// הוספת אירוע חדש
app.post('/api/events', (req, res) => {
  try {
    const events = loadEventsData();
    const newEvent = {
      id: Date.now(), // יצירת ID ייחודי
      ...req.body,
      createdAt: new Date().toISOString()
    };

    events.push(newEvent);
    saveEventsData(events);
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// קבלת יצירות לפי קטגוריה
app.get('/creations/:category', (req, res) => {
  try {
    const data = loadCreationsData();
    const category = req.params.category;
    
    if (!data[category]) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(data[category]);
  } catch (error) {
    console.error('שגיאה בטעינת היצירות:', error);
    res.status(500).json({ error: 'Failed to load creations' });
  }
});

// העלאת יצירה חדשה
app.post('/upload-creation', upload.single('file'), (req, res) => {
  try {
    console.log('קיבלתי בקשת העלאת יצירה:', req.body);
    console.log('קובץ שהתקבל:', req.file);
    
    if (!req.file) {
      console.error('לא התקבל קובץ');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const category = req.body.category;
    console.log('קטגוריה שהתקבלה:', category);
    
    if (!category) {
      console.error('לא התקבלה קטגוריה');
      // מחיקת הקובץ אם לא התקבלה קטגוריה
      fs.unlinkSync(path.join(uploadDir, req.file.filename));
      return res.status(400).json({ error: 'Category is required' });
    }
    
    const data = loadCreationsData();
    console.log('נתוני יצירות שנטענו:', data);
    
    if (!data[category]) {
      console.error('קטגוריה לא קיימת:', category);
      // מחיקת הקובץ אם הקטגוריה לא קיימת
      fs.unlinkSync(path.join(uploadDir, req.file.filename));
      return res.status(404).json({ error: 'Category not found' });
    }

    const creation = {
      id: Date.now().toString(),
      path: `uploads/${req.file.filename}`,
      name: req.file.originalname,
      timestamp: Date.now()
    };
    
    console.log('יצירה חדשה:', creation);

    data[category].push(creation);
    saveCreationsData(data);
    
    console.log('יצירה נשמרה בהצלחה');
    res.json(creation);
  } catch (error) {
    console.error('שגיאה בהעלאת יצירה:', error);
    
    // ניסיון למחוק את הקובץ במקרה של שגיאה
    if (req.file) {
      try {
        fs.unlinkSync(path.join(uploadDir, req.file.filename));
      } catch (e) {
        console.error('שגיאה במחיקת קובץ לאחר כישלון בהעלאה:', e);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload creation', details: error.message });
  }
});

// מחיקת יצירה
app.delete('/creations/:id', (req, res) => {
  try {
    const creationId = req.params.id;
    console.log('מנסה למחוק יצירה עם ID:', creationId);
    
    const data = loadCreationsData();
    let found = false;
    
    // חיפוש היצירה בכל הקטגוריות
    for (const category in data) {
      const index = data[category].findIndex(creation => creation.id === creationId);
      if (index !== -1) {
        const creation = data[category][index];
        console.log('נמצאה יצירה למחיקה בקטגוריה:', category, 'יצירה:', creation);
        
        // מחיקת הקובץ
        try {
          fs.unlinkSync(path.join(__dirname, creation.path));
          console.log('הקובץ נמחק בהצלחה:', creation.path);
        } catch (e) {
          console.error('שגיאה במחיקת קובץ:', e);
        }
        
        // מחיקת הנתונים
        data[category].splice(index, 1);
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.error('יצירה לא נמצאה:', creationId);
      return res.status(404).json({ error: 'Creation not found' });
    }
    
    saveCreationsData(data);
    console.log('יצירה נמחקה בהצלחה');
    res.json({ success: true });
  } catch (error) {
    console.error('שגיאה במחיקת היצירה:', error);
    res.status(500).json({ error: 'Failed to delete creation' });
  }
});

// טיפול בשגיאות
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON parsing error:', err.message);
    return res.status(400).json({ error: 'Invalid JSON', details: err.message });
  }
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// הגדרת middleware לטיפול בשגיאות JSON
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON:', e.message);
      res.status(400).json({ error: 'Invalid JSON', details: e.message });
      throw new SyntaxError('Invalid JSON');
    }
  }
}));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 