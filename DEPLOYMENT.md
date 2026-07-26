# Fast Cloudflare Deployment Checklist

1. Upload this folder to a GitHub repository.
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git.
3. Framework: None.
4. Build command: blank.
5. Output directory: `.`
6. Deploy.
7. Create D1 database: `midnight-travel-consulting`.
8. Run `schema.sql` in the D1 Console.
9. Pages project → Settings → Bindings → add D1 binding named `DB`.
10. Redeploy and submit a test consultation.

Test query:

```sql
SELECT reference, created_at, full_name, company, email
FROM consultation_requests
ORDER BY created_at DESC;
```
