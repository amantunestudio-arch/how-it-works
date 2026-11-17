import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Blog from './pages/Blog.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Article from './pages/Article.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './dashboard/Login.jsx';
import Dashboard from './dashboard/Dashboard.jsx';
import Editor from './dashboard/Editor.jsx';

// tiiny.host wali public build (VITE_HASH=1) me dashboard routes hata diye jaate hain
const ADMIN = import.meta.env.DEV || import.meta.env.VITE_HASH !== '1';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="articles/:slug" element={<Article />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {ADMIN && <Route path="dashboard/login" element={<Login />} />}
      {ADMIN && <Route path="dashboard" element={<Dashboard />} />}
      {ADMIN && <Route path="dashboard/new" element={<Editor />} />}
      {ADMIN && <Route path="dashboard/edit/:slug" element={<Editor />} />}
    </Routes>
  );
}
