# Final Submission Checklist

## A) Environment
- [ ] Node.js installed
- [ ] MongoDB connection configured in backend `.env`
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed

## B) Run Commands
- [ ] Backend starts successfully
```powershell
Set-Location "backend"
npm run dev
```
- [ ] Frontend starts successfully
```powershell
Set-Location "frontend"
npm run dev
```

## C) Validation Commands
- [ ] Backend tests pass
```powershell
Set-Location "backend"
npm test
```
- [ ] Frontend lint passes
```powershell
Set-Location "frontend"
npm run lint
```
- [ ] End-to-end workflow scenario passes
```powershell
Set-Location "backend"
npm run scenario:workflow
```

## D) Functional Smoke Checks
- [ ] Manager can assign driver to bus
- [ ] Driver notification appears
- [ ] Customer can complete booking
- [ ] Customer sees assigned driver in booking
- [ ] Driver sees booking + seat and marks boarded
- [ ] Admin sees trip manifest with timings and assignments

## E) Submission Package
- [ ] `SUBMISSION_GUIDE.md` included
- [ ] `DEMO_SCRIPT.md` included
- [ ] `FINAL_CHECKLIST.md` completed
- [ ] Screenshots or short demo recording captured (optional but recommended)

## F) Last-Minute Safety
- [ ] Do not add new risky features
- [ ] Keep stable seed credentials ready
- [ ] Keep backup terminal demo command ready

Backup command:
```powershell
Set-Location "backend"
npm run scenario:workflow
```
