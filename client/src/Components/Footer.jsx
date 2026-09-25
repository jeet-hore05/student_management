function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="w-full bg-gray-800 text-white py-5">
            <div className="flex items-center justify-center text-sm sm:text-base">
                Copyright {year} | All rights reserved
            </div>
        </footer>
    );
}

export default Footer;