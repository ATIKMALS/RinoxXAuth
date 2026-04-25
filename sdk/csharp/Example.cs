using System;
using System.Threading.Tasks;
using YourAuth;

internal class Program
{
    private static async Task Main()
    {
        Console.WriteLine("========================================");
        Console.WriteLine("  RinoxAuth - C# Example");
        Console.WriteLine("========================================");
        Console.WriteLine();

        // ============================================
        // INITIALIZE CLIENT
        // ============================================
        var client = new AuthClient(
            appName: "atik",
            ownerIdOrAppKey: "04fad000",                          // Owner ID from dashboard
            secret: "02f70ade4635008aa47f4522ef58a69e98654c3ebf25494ef7d9f9b5b6272b6b", // App Secret from dashboard
            version: "1.0.0",
            apiBaseUrl: "http://127.0.0.1:8000"
        );

        // Init connection
        if (!await client.Init())
        {
            Console.WriteLine("❌ Connection failed: " + client.Message);
            Console.WriteLine("Make sure backend is running at http://127.0.0.1:8000");
            Console.ReadLine();
            return;
        }
        Console.WriteLine("✅ Connected to RinoxAuth server!");
        Console.WriteLine();

        // ============================================
        // SHOW MENU
        // ============================================
        while (true)
        {
            Console.WriteLine("Select login method:");
            Console.WriteLine("  1. Username & Password Login");
            Console.WriteLine("  2. License Key Login");
            Console.WriteLine("  3. Validate License Only");
            Console.WriteLine("  4. Register New Account");
            Console.WriteLine("  5. Exit");
            Console.WriteLine();
            Console.Write("Enter choice (1-5): ");
            
            var choice = Console.ReadLine() ?? "";

            switch (choice)
            {
                case "1":
                    await UsernamePasswordLogin(client);
                    break;
                case "2":
                    await LicenseKeyLogin(client);
                    break;
                case "3":
                    await ValidateLicenseOnly(client);
                    break;
                case "4":
                    await RegisterAccount(client);
                    break;
                case "5":
                    Console.WriteLine("Goodbye! 👋");
                    return;
                default:
                    Console.WriteLine("Invalid choice! Try again.");
                    break;
            }

            Console.WriteLine();
            Console.WriteLine("Press any key to continue...");
            Console.ReadKey();
            Console.Clear();
        }
    }

    // ============================================
    // 1. USERNAME & PASSWORD LOGIN
    // ============================================
    private static async Task UsernamePasswordLogin(AuthClient client)
    {
        Console.WriteLine();
        Console.WriteLine("--- Username & Password Login ---");

        Console.Write("Username: ");
        var username = Console.ReadLine() ?? "";

        Console.Write("Password: ");
        var password = ReadPassword();

        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            Console.WriteLine("❌ Username and password are required!");
            return;
        }

        Console.Write("Logging in");

        if (await client.Login(username, password))
        {
            Console.WriteLine(" ✅");
            Console.WriteLine();
            Console.WriteLine("🔥 Login Successful!");
            Console.WriteLine($"   Username: {client.User?.username}");
            Console.WriteLine($"   Plan:     {client.User?.plan}");
            Console.WriteLine($"   Expires:  {client.User?.expiry}");
            Console.WriteLine($"   HWID:     {client.User?.hwid}");
            Console.WriteLine($"   Days Left: {client.User?.DaysRemaining() ?? 0}");
            Console.WriteLine($"   Token:    {client.Token?[..20]}...");
        }
        else
        {
            Console.WriteLine(" ❌");
            Console.WriteLine($"❌ Login Failed: {client.Message}");
        }
    }

    // ============================================
    // 2. LICENSE KEY LOGIN (No username/password)
    // ============================================
    private static async Task LicenseKeyLogin(AuthClient client)
    {
        Console.WriteLine();
        Console.WriteLine("--- License Key Login ---");
        Console.WriteLine("(No username/password needed)");

        Console.Write("License Key: ");
        var licenseKey = Console.ReadLine() ?? "";

        if (string.IsNullOrEmpty(licenseKey))
        {
            Console.WriteLine("❌ License key is required!");
            return;
        }

        Console.Write("Logging in with license");

        // ✅ Use QuickLicenseLogin - auto creates user if needed
        if (await client.QuickLicenseLogin(licenseKey))
        {
            Console.WriteLine(" ✅");
            Console.WriteLine();
            Console.WriteLine("🔥 License Login Successful!");
            Console.WriteLine($"   Username: {client.User?.username}");
            Console.WriteLine($"   Plan:     {client.User?.plan}");
            Console.WriteLine($"   Expires:  {client.User?.expiry}");
            Console.WriteLine($"   HWID:     {client.User?.hwid}");
        }
        else
        {
            Console.WriteLine(" ❌");
            Console.WriteLine($"❌ Login Failed: {client.Message}");
        }
    }

    // ============================================
    // 3. VALIDATE LICENSE ONLY (No login)
    // ============================================
    private static async Task ValidateLicenseOnly(AuthClient client)
    {
        Console.WriteLine();
        Console.WriteLine("--- Validate License Only ---");

        Console.Write("License Key: ");
        var licenseKey = Console.ReadLine() ?? "";

        if (string.IsNullOrEmpty(licenseKey))
        {
            Console.WriteLine("❌ License key is required!");
            return;
        }

        Console.Write("Validating license");

        if (await client.ValidateLicense(licenseKey))
        {
            Console.WriteLine(" ✅");
            Console.WriteLine();
            Console.WriteLine("✅ License is VALID!");
            Console.WriteLine("   This license can be used to login.");
        }
        else
        {
            Console.WriteLine(" ❌");
            Console.WriteLine($"❌ Invalid License: {client.Message}");
        }
    }

    // ============================================
    // 4. REGISTER NEW ACCOUNT
    // ============================================
    private static async Task RegisterAccount(AuthClient client)
    {
        Console.WriteLine();
        Console.WriteLine("--- Register New Account ---");

        Console.Write("Username: ");
        var username = Console.ReadLine() ?? "";

        Console.Write("Password: ");
        var password = ReadPassword();

        Console.Write("License Key (optional, press Enter to skip): ");
        var licenseKey = Console.ReadLine() ?? "";

        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            Console.WriteLine("❌ Username and password are required!");
            return;
        }

        Console.Write("Registering");

        string? key = string.IsNullOrEmpty(licenseKey) ? null : licenseKey;

        if (await client.Register(username, password, key))
        {
            Console.WriteLine(" ✅");
            Console.WriteLine();
            Console.WriteLine("✅ Registration Successful!");
            Console.WriteLine("   You can now login with your username and password.");
        }
        else
        {
            Console.WriteLine(" ❌");
            Console.WriteLine($"❌ Registration Failed: {client.Message}");
        }
    }

    // ============================================
    // HELPER: Read password (masked)
    // ============================================
    private static string ReadPassword()
    {
        var password = "";
        while (true)
        {
            var key = Console.ReadKey(true);
            if (key.Key == ConsoleKey.Enter) break;
            if (key.Key == ConsoleKey.Backspace && password.Length > 0)
            {
                password = password[..^1];
                Console.Write("\b \b");
            }
            else if (key.Key != ConsoleKey.Backspace)
            {
                password += key.KeyChar;
                Console.Write("*");
            }
        }
        Console.WriteLine();
        return password;
    }
}