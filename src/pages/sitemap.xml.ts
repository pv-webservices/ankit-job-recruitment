import type { APIRoute } from 'astro';
import { publicRoutes } from '../data/routes';
export const GET: APIRoute = ({ site }) => new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${site ? publicRoutes.map(path => `<url><loc>${new URL(path, site).href.replace(/&/g, '&amp;')}</loc></url>`).join('') : ''}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
