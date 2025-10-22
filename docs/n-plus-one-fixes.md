# N+1 Query Problem Analysis & Fixes

**Date:** 2025-10-22  
**Status:** Analysis Complete, Fixes Recommended

---

## What is N+1 Problem?

N+1 query problem occurs when:
1. You fetch N records (1 query)
2. For each record, you fetch related data (N queries)
3. Total: 1 + N queries instead of 1-2 queries

**Example:**
```typescript
// BAD: N+1 Problem (101 queries for 100 companies)
const companies = await prisma.company.findMany(); // 1 query
for (const company of companies) {
  const reviews = await prisma.review.findMany({ // 100 queries!
    where: { companyId: company.id }
  });
}

// GOOD: Eager Loading (1 query)
const companies = await prisma.company.findMany({
  include: {
    reviews: true // Joined in single query
  }
});
```

---

## Common N+1 Patterns in Codebase

### 1. Company Listings with Review Counts

**Location:** `/api/companies`, `/api/search`

**Problem:**
```typescript
// Fetches companies
const companies = await prisma.company.findMany();

// Then for each company, counts reviews (N queries)
for (const company of companies) {
  const reviewCount = await prisma.review.count({
    where: { companyId: company.id }
  });
}
```

**Fix:**
```typescript
const companies = await prisma.company.findMany({
  include: {
    _count: {
      select: { reviews: true }
    }
  }
});

// Access: company._count.reviews
```

---

### 2. Company with Photos

**Location:** Company detail pages

**Problem:**
```typescript
const company = await prisma.company.findUnique({ where: { id } });
const photos = await prisma.photo.findMany({ 
  where: { companyId: id } 
});
```

**Fix:**
```typescript
const company = await prisma.company.findUnique({
  where: { id },
  include: {
    photos: {
      take: 10,
      orderBy: { createdAt: 'desc' }
    }
  }
});
```

---

### 3. Reviews with Company Info

**Location:** `/api/reviews`, Admin dashboard

**Problem:**
```typescript
const reviews = await prisma.review.findMany();
for (const review of reviews) {
  const company = await prisma.company.findUnique({
    where: { id: review.companyId }
  });
}
```

**Fix:**
```typescript
const reviews = await prisma.review.findMany({
  include: {
    company: {
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true
      }
    }
  }
});
```

---

### 4. Company Content per Domain

**Location:** Multi-domain pages

**Problem:**
```typescript
const companies = await prisma.company.findMany();
for (const company of companies) {
  const content = await prisma.companyContent.findFirst({
    where: { companyId: company.id, domainId: currentDomainId }
  });
}
```

**Fix:**
```typescript
const companies = await prisma.company.findMany({
  include: {
    content: {
      where: { domainId: currentDomainId },
      take: 1
    }
  }
});
```

---

### 5. Company with Owner Info

**Location:** Admin panel, Business dashboard

**Problem:**
```typescript
const companies = await prisma.company.findMany();
for (const company of companies) {
  const ownership = await prisma.companyOwnership.findFirst({
    where: { companyId: company.id }
  });
}
```

**Fix:**
```typescript
const companies = await prisma.company.findMany({
  include: {
    ownerships: {
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }
  }
});
```

---

## Prisma Best Practices

### 1. Use `include` for Relations
```typescript
// Instead of separate queries
const company = await prisma.company.findUnique({
  include: {
    reviews: true,
    photos: true,
    content: true
  }
});
```

### 2. Use `select` to Limit Fields
```typescript
// Only fetch needed fields
const companies = await prisma.company.findMany({
  select: {
    id: true,
    name: true,
    rating: true,
    _count: {
      select: { reviews: true }
    }
  }
});
```

### 3. Use Pagination
```typescript
// Don't fetch all records
const companies = await prisma.company.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' }
});
```

### 4. Use Cursor-based Pagination for Large Datasets
```typescript
const companies = await prisma.company.findMany({
  take: 20,
  cursor: lastId ? { id: lastId } : undefined,
  skip: lastId ? 1 : 0,
  orderBy: { id: 'asc' }
});
```

---

## Query Optimization Checklist

### Before Optimization
- [ ] Identify slow endpoints (>500ms)
- [ ] Enable Prisma query logging
- [ ] Count queries per request
- [ ] Identify N+1 patterns

### During Optimization
- [ ] Add `include` for relations
- [ ] Use `select` for specific fields
- [ ] Add proper indexes
- [ ] Test query performance

### After Optimization
- [ ] Measure response time improvement
- [ ] Check query count reduction
- [ ] Monitor database load
- [ ] Update documentation

---

## Monitoring Queries

### Enable Prisma Logging
```typescript
// prisma/client.ts
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});
```

### Count Queries in Development
```typescript
let queryCount = 0;

prisma.$use(async (params, next) => {
  queryCount++;
  console.log(`Query #${queryCount}:`, params.model, params.action);
  return next(params);
});
```

---

## Expected Performance Improvements

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| Company list (100) | 101 queries | 1 query | 99% ⬇️ |
| Company detail | 5 queries | 1 query | 80% ⬇️ |
| Review list (50) | 51 queries | 1 query | 98% ⬇️ |
| Search results | 150 queries | 2 queries | 99% ⬇️ |

**Response Time:**
- Before: 500-2000ms
- After: 50-200ms
- **Improvement: 75-90%** ⚡

---

## Action Items

### High Priority 🔴
1. [ ] Fix company listings N+1 (most used)
2. [ ] Fix search results N+1
3. [ ] Fix company detail page N+1

### Medium Priority 🟡
1. [ ] Fix admin dashboard queries
2. [ ] Fix review listings
3. [ ] Add query monitoring

### Low Priority 🟢
1. [ ] Optimize less-used endpoints
2. [ ] Add query caching
3. [ ] Implement cursor pagination

---

## Files to Update

1. `/src/app/api/companies/route.ts`
2. `/src/app/api/search/route.ts`
3. `/src/app/api/companies/[id]/route.ts`
4. `/src/app/api/reviews/route.ts`
5. `/src/app/api/admin/companies/route.ts`

---

**Next Steps:**
1. Apply migration for indexes
2. Update API routes with eager loading
3. Test performance improvements
4. Monitor production queries

