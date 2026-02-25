# Semester Project 2 – Auction Website

<img width="2545" height="1299" alt="AH-screenshot" src="https://github.com/user-attachments/assets/acd59e70-17e2-430c-b08f-cb4e34a7698f" />


A frontend auction website where registered users can create listings, place bids, and manage their profiles.

---

## Description

This project is a auction platform built as part of Semester Project 2.

The application allows users with a `stud.noroff.no` email address to register, log in, and interact with auction listings. The platform includes authentication, listing management, bidding functionality, and profile customization.

### Features

- User registration (restricted to `stud.noroff.no` email addresses)
- User login and logout
- Update user avatar
- View user credit balance
- Create auction listings with:
  - Title
  - Description
  - Deadline date
  - Media gallery
- Place bids on other users' listings
- View bids on listings
- Search listings (available to unregistered users)
- Responsive design using Bootstrap
- API integration using fetch
- Authentication stored in localStorage

---

## Built With

- HTML5
- CSS3
- Bootstrap
- JavaScript (Vanilla JS)
- Noroff Auction API

---

## Getting Started

### Installing

To get a local copy up and running:

Clone the repository:

```bash
git clone https://github.com/OH2021/Semester-Project-2.git
```

Navigate into the project folder:

```bash
cd Semester-Project-2
```

---

## Running


- Opening `index.html` directly in your browser  

or  

- Using Live Server in VS Code for a better development experience.

If using VS Code:

1. Install the Live Server extension.
2. Right-click `index.html`
3. Select **Open with Live Server**

---

## Project Structure

```
/js
  ├── auth.js        (Authentication logic)
  ├── avatar.js      (Avatar update functionality)
  ├── listings.js    (Listings, bidding & search functionality)

index.html
profile.html
create-listing.html
styles.css
```

---

## Contributing

This project was developed as a school assignment and is not currently open for external contributions.

If you would like to suggest improvements:

1. Fork the repository
2. Create a new branch
3. Submit a pull request

---

## Contact

- GitHub: https://github.com/OH2021  
- Email: ole.henrik.haug@gmail.com  
- LinkedIn: https://www.linkedin.com/in/ole-henrik-haug-8a17751b9/

---

## License

This project is created for educational purposes as part of the Noroff Frontend Development program.

---

## Acknowledgments

- Noroff Frontend Development Program
- Noroff Auction API
- Bootstrap Documentation
