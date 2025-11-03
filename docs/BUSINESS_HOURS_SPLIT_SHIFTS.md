# Business Hours - Split Shifts Support

## Overview

The business hours system now supports **split shifts** (multiple working periods per day). This is essential for businesses with lunch breaks or other interruptions.

## Example Use Cases

- **Restaurants**: Open 12:00-14:00 (lunch) and 19:00-22:00 (dinner)
- **Shops**: Open 09:00-12:00 and 14:00-18:00 (lunch break)
- **Medical offices**: Open 08:00-12:00 and 14:00-17:00

## Data Format

### New Format (Recommended) - Multiple Shifts

```json
{
  "monday": {
    "closed": false,
    "shifts": [
      { "open": "09:00", "close": "12:00" },
      { "open": "14:00", "close": "18:00" }
    ]
  },
  "tuesday": {
    "closed": false,
    "shifts": [
      { "open": "09:00", "close": "12:00" },
      { "open": "14:00", "close": "18:00" }
    ]
  },
  "sunday": {
    "closed": true,
    "shifts": []
  }
}
```

### Legacy Format (Still Supported) - Single Shift

```json
{
  "monday": {
    "open": "09:00",
    "close": "18:00",
    "closed": false
  },
  "sunday": {
    "open": "00:00",
    "close": "00:00",
    "closed": true
  }
}
```

## API Endpoints

### GET /api/companies/[id]/hours

Returns business hours in the new format. Legacy data is automatically converted.

**Response:**
```json
{
  "monday": {
    "closed": false,
    "shifts": [
      { "open": "09:00", "close": "12:00" },
      { "open": "14:00", "close": "18:00" }
    ]
  },
  "specialHours": [],
  "timezone": "Europe/Paris"
}
```

### PUT /api/companies/[id]/hours

Update business hours. Accepts both formats.

**Request Body:**
```json
{
  "monday": {
    "closed": false,
    "shifts": [
      { "open": "09:00", "close": "12:00" },
      { "open": "14:00", "close": "18:00" }
    ]
  },
  "tuesday": {
    "closed": false,
    "shifts": [
      { "open": "09:00", "close": "18:00" }
    ]
  },
  "timezone": "Europe/Paris"
}
```

## Validation Rules

- ✅ Maximum 3 shifts per day
- ✅ Time format: HH:MM (24-hour)
- ✅ Shifts must not overlap
- ✅ If `closed: true`, shifts array must be empty
- ✅ Timezone defaults to "Europe/Paris"

## Frontend Implementation

### Display Hours

```typescript
function formatBusinessHours(dayData: any): string {
  if (!dayData || dayData.closed) {
    return 'Fermé';
  }

  // New format (shifts array)
  if (dayData.shifts && dayData.shifts.length > 0) {
    return dayData.shifts
      .map((shift: any) => `${shift.open} - ${shift.close}`)
      .join(', ');
  }

  // Legacy format (single open/close)
  if (dayData.open && dayData.close) {
    return `${dayData.open} - ${dayData.close}`;
  }

  return 'Fermé';
}

// Example usage
const monday = { closed: false, shifts: [
  { open: '09:00', close: '12:00' },
  { open: '14:00', close: '18:00' }
]};

console.log(formatBusinessHours(monday));
// Output: "09:00 - 12:00, 14:00 - 18:00"
```

### Edit Hours Form

```tsx
interface Shift {
  open: string;
  close: string;
}

interface DayHours {
  closed: boolean;
  shifts: Shift[];
}

function BusinessHoursEditor({ day }: { day: DayHours }) {
  const addShift = () => {
    if (day.shifts.length < 3) {
      day.shifts.push({ open: '09:00', close: '18:00' });
    }
  };

  const removeShift = (index: number) => {
    day.shifts.splice(index, 1);
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={day.closed}
          onChange={(e) => day.closed = e.target.checked}
        />
        Fermé
      </label>

      {!day.closed && day.shifts.map((shift, index) => (
        <div key={index}>
          <input
            type="time"
            value={shift.open}
            onChange={(e) => shift.open = e.target.value}
          />
          <span>-</span>
          <input
            type="time"
            value={shift.close}
            onChange={(e) => shift.close = e.target.value}
          />
          <button onClick={() => removeShift(index)}>Supprimer</button>
        </div>
      ))}

      {!day.closed && day.shifts.length < 3 && (
        <button onClick={addShift}>Ajouter une plage horaire</button>
      )}
    </div>
  );
}
```

## Migration from Legacy Format

The system automatically migrates legacy data when fetched via GET endpoints. No manual migration required.

**Automatic Conversion:**
```javascript
// Input (legacy)
{ open: '09:00', close: '18:00', closed: false }

// Output (new format)
{
  closed: false,
  shifts: [{ open: '09:00', close: '18:00' }]
}
```

## Database Schema

Business hours are stored as JSON in the `business_hours` table:

```prisma
model BusinessHours {
  monday    Json?  // Can be legacy or new format
  tuesday   Json?
  // ... other days
  specialHours Json?
  timezone  String @default("Europe/Paris")
}
```

## Best Practices

1. **Always use the new format for new data** - Legacy format is only for backwards compatibility
2. **Validate shift overlaps** - Ensure shifts don't overlap (e.g., 9-12 and 11-14 would be invalid)
3. **Sort shifts chronologically** - Display shifts in order (morning to evening)
4. **Handle timezone conversions** - Store hours in business's local timezone
5. **Special hours override regular hours** - Check specialHours array for exceptions (holidays, etc.)

## Common Patterns

### Restaurant Hours
```json
{
  "monday": {
    "closed": false,
    "shifts": [
      { "open": "12:00", "close": "14:30" },
      { "open": "19:00", "close": "22:30" }
    ]
  }
}
```

### Retail Shop Hours
```json
{
  "monday": {
    "closed": false,
    "shifts": [
      { "open": "09:00", "close": "12:00" },
      { "open": "14:00", "close": "19:00" }
    ]
  },
  "sunday": {
    "closed": true,
    "shifts": []
  }
}
```

### 24/7 Business
```json
{
  "monday": {
    "closed": false,
    "shifts": [{ "open": "00:00", "close": "23:59" }]
  }
}
```

## Troubleshooting

### Hours not saving
- Check validation errors in API response
- Ensure time format is HH:MM (e.g., "09:00" not "9:00")
- Verify shifts array is not empty when closed=false

### Hours showing wrong format
- Clear browser cache and reload
- Check API response format
- Verify normalization function is working

### Multiple shifts not displaying
- Ensure frontend uses new format
- Check if shifts array exists
- Use formatBusinessHours() helper function
