# Rich Text Descriptions - Visual Content Support

## Overview

Company descriptions now support **rich text formatting** with images, links, and other visual content. This allows for more engaging and professional company profiles.

## Features

### Text Formatting
- **Bold** and *Italic* text
- Headings (H2, H3)
- Bullet lists
- Numbered lists
- Blockquotes

### Media Support
- **Images** - Add photos, logos, and visual content
- **Links** - Hyperlinks to external resources
- **Styling** - Professional formatting with consistent design

### Security
- All HTML is **sanitized** using DOMPurify
- XSS protection built-in
- Only safe HTML tags and attributes allowed

## How to Use

### For Admins (Editing Descriptions)

1. **Navigate to Company Edit Page**
   - Go to `/admin/companies/{id}/edit`
   - Click the "Domains" tab

2. **Use the Rich Text Editor**
   - The editor toolbar has formatting buttons
   - Click **B** for bold, **I** for italic
   - Use **H2** or **H3** for headings
   - Click **🔗** to add links
   - Click **🖼️** to add images

3. **Adding Images**
   - Click the image button (🖼️)
   - Enter the full URL of the image
   - Images are automatically responsive
   - Supported formats: JPG, PNG, WebP, AVIF

4. **Adding Links**
   - Select text or click where you want the link
   - Click the link button (🔗)
   - Enter the URL (e.g., https://example.com)

5. **Formatting Tips**
   - Use **H2** for main sections
   - Use **H3** for subsections
   - Use **bullet lists** for features or services
   - Use **bold** to emphasize important points

### Example Rich Text Content

```html
<h2>Notre entreprise</h2>
<p>Bienvenue chez <strong>Restaurant Le Gourmet</strong>. Nous sommes spécialisés dans la cuisine française traditionnelle.</p>

<h3>Nos spécialités</h3>
<ul>
  <li>Coq au Vin</li>
  <li>Bouillabaisse</li>
  <li>Ratatouille</li>
</ul>

<p>Visitez notre site web : <a href="https://example.com">www.example.com</a></p>

<img src="https://example.com/images/restaurant.jpg" alt="Notre restaurant" />
```

## Technical Implementation

### Components

1. **RichTextEditor.tsx**
   - Location: `src/components/RichTextEditor.tsx`
   - Based on TipTap editor
   - Provides WYSIWYG editing interface
   - Toolbar with formatting buttons

2. **SafeHTML.tsx**
   - Location: `src/components/SafeHTML.tsx`
   - Renders HTML safely on the frontend
   - Uses DOMPurify for XSS protection
   - Applies prose styling

### Database Schema

No schema changes required. The `customDescription` field in `CompanyContent` table already supports text/HTML:

```prisma
model CompanyContent {
  id                  Int       @id @default(autoincrement())
  companyId           Int
  domainId            Int
  customDescription   String?   // Now supports HTML
  // ... other fields
}
```

### API Endpoints

**GET /api/companies/[id]/content**
- Returns customDescription as HTML

**PUT /api/companies/[id]/content**
- Accepts HTML in customDescription field
- No server-side sanitization (client already sends safe HTML)

### Allowed HTML Tags

For security, only these tags are allowed:

- **Text**: `p`, `br`, `strong`, `em`, `u`
- **Headings**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- **Lists**: `ul`, `ol`, `li`
- **Links**: `a` (with href, title, target, rel attributes)
- **Images**: `img` (with src, alt, title, class attributes)
- **Code**: `code`, `pre`
- **Quotes**: `blockquote`

### Allowed Attributes

- `href` - For links
- `src` - For images
- `alt` - For images
- `title` - For hover text
- `class` - For styling
- `target` - For opening links in new tab
- `rel` - For link relationships

### URL Validation

Only safe URL schemes are allowed:
- `http://` and `https://` - Web links
- `mailto:` - Email links
- `tel:` - Phone links
- `sms:` - SMS links

Blocked schemes:
- `javascript:` - XSS prevention
- `data:` - Prevents data injection
- `file:` - Security

## Best Practices

### Content Guidelines

1. **Use Headings Wisely**
   - H2 for main sections
   - H3 for subsections
   - Don't skip heading levels

2. **Image Optimization**
   - Use optimized images (< 500KB)
   - Prefer WebP or AVIF formats
   - Host images on CDN if possible
   - Always add alt text for accessibility

3. **Link Guidelines**
   - Always use HTTPS links
   - Add `rel="noopener noreferrer"` for external links (auto-added)
   - Use descriptive link text

4. **Formatting**
   - Keep paragraphs short (2-4 sentences)
   - Use lists for better readability
   - Use bold sparingly for emphasis

### Accessibility

- **Alt Text**: Always add alt text to images
- **Link Text**: Use descriptive text (not "click here")
- **Headings**: Use proper heading hierarchy
- **Color Contrast**: Ensure text is readable

### Performance

- **Image Size**: Keep images under 500KB
- **Image Dimensions**: Max width 1200px
- **Loading**: Images lazy-load automatically
- **Caching**: Images cached for 30 days

## Migration from Plain Text

Existing descriptions are backwards compatible:

```javascript
// Old format (plain text)
"This is a description.\nWith line breaks."

// New format (HTML)
"<p>This is a description.</p><p>With line breaks.</p>"

// Both work! The SafeHTML component handles both.
```

To migrate existing content:
1. Old text displays as-is (wrapped in `<p>`)
2. Edit and save to convert to HTML
3. No data loss during migration

## Troubleshooting

### Images Not Showing

1. **Check URL**: Ensure the image URL is valid and accessible
2. **HTTPS**: Use HTTPS URLs (not HTTP)
3. **CORS**: Ensure the image server allows cross-origin requests
4. **File Size**: Large images may load slowly

### Formatting Not Applied

1. **Check HTML**: Ensure HTML tags are properly closed
2. **Allowed Tags**: Only whitelisted tags work
3. **Cache**: Clear browser cache
4. **CSS**: Check if prose styles are loaded

### Links Not Clickable

1. **Check URL**: Ensure URL starts with http:// or https://
2. **Blocked Schemes**: javascript: and data: URLs are blocked
3. **Syntax**: Use `<a href="...">text</a>` format

## Future Enhancements

- [ ] **File Upload** - Upload images directly (not just URLs)
- [ ] **Image Gallery** - Built-in image picker
- [ ] **Templates** - Pre-designed description templates
- [ ] **AI Enhancement** - Auto-format AI-generated descriptions
- [ ] **Markdown Support** - Alternative to HTML
- [ ] **Video Embeds** - YouTube, Vimeo support
- [ ] **Tables** - Add table support for pricing

## Related Files

- `src/components/RichTextEditor.tsx` - Editor component
- `src/components/SafeHTML.tsx` - Safe HTML renderer
- `src/components/CompanyEditForm.tsx` - Uses RichTextEditor
- `src/app/companies/[slug]/page.tsx` - Displays SafeHTML
- `src/app/globals.css` - Prose styles
- `docs/RICH_TEXT_DESCRIPTIONS.md` - This file

---

**Last Updated**: 2025-01-06
**Maintained By**: NETZ Development Team
