const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-4 bg-opacity-5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-center items-center py-2">
          <p className="text-sm opacity-70">
            <span className="font-medium">Snippet-Store</span> &copy; {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;