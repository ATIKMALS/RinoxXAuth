using System;
using System.Collections.Generic;
using System.Management;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace YourAuth
{
    // ============================================
    // AUTH CLIENT CLASS
    // ============================================
    public class AuthClient
    {
        // Properties
        public bool IsSuccess { get; private set; }
        public string Message { get; private set; }
        public UserInfo User { get; private set; }
        public string Token { get; private set; }

        // Private fields
        private readonly string _apiUrl;
        private readonly string _appName;
        private readonly string _ownerIdOrAppKey;
        private readonly string _secret;
        private readonly string _version;

        private static readonly HttpClient Http = new HttpClient();

        // ============================================
        // CONSTRUCTOR
        // ============================================
        public AuthClient(string appName, string ownerIdOrAppKey, string secret, string version, string apiBaseUrl)
        {
            _appName = appName;
            _ownerIdOrAppKey = ownerIdOrAppKey;
            _secret = secret;
            _version = version;
            _apiUrl = apiBaseUrl.TrimEnd('/') + "/api/auth";
        }

        // ============================================
        // INIT - Check connection
        // ============================================
        public async Task<bool> Init()
        {
            var payload = new Dictionary<string, object>
            {
                ["type"] = "init",
                ["appname"] = _appName,
                ["ownerid"] = _ownerIdOrAppKey,
                ["secret"] = _secret,
                ["version"] = _version
            };

            await SendAsync(payload);
            return IsSuccess;
        }

        // ============================================
        // LOGIN - Username & Password
        // ============================================
        public async Task<bool> Login(string username, string password)
        {
            var payload = new Dictionary<string, object>
            {
                ["type"] = "login",
                ["appname"] = _appName,
                ["ownerid"] = _ownerIdOrAppKey,
                ["secret"] = _secret,
                ["username"] = username,
                ["password"] = password,
                ["hwid"] = GetHwid()
            };

            await SendAsync(payload);
            return IsSuccess;
        }

        // ============================================
        // LICENSE - Validate license key
        // ============================================
        public async Task<bool> License(string key)
        {
            var payload = new Dictionary<string, object>
            {
                ["type"] = "license",
                ["appname"] = _appName,
                ["ownerid"] = _ownerIdOrAppKey,
                ["secret"] = _secret,
                ["key"] = key,
                ["hwid"] = GetHwid()
            };

            await SendAsync(payload);
            return IsSuccess;
        }

        // ============================================
        // VALIDATE LICENSE (Alias for License)
        // ============================================
        public async Task<bool> ValidateLicense(string key)
        {
            return await License(key);
        }

        // ============================================
        // ✅ LICENSE LOGIN - Login with license key only
        // ============================================
        public async Task<bool> LicenseLogin(string key)
        {
            var payload = new Dictionary<string, object>
            {
                ["type"] = "license-login",
                ["appname"] = _appName,
                ["ownerid"] = _ownerIdOrAppKey,
                ["secret"] = _secret,
                ["key"] = key,
                ["hwid"] = GetHwid()
            };

            await SendAsync(payload);
            return IsSuccess;
        }

        // ============================================
        // ✅ REGISTER
        // ============================================
        public async Task<bool> Register(string username, string password, string licenseKey = null)
        {
            var payload = new Dictionary<string, object>
            {
                ["type"] = "register",
                ["appname"] = _appName,
                ["ownerid"] = _ownerIdOrAppKey,
                ["secret"] = _secret,
                ["username"] = username,
                ["password"] = password,
                ["hwid"] = GetHwid()
            };

            if (!string.IsNullOrEmpty(licenseKey))
            {
                payload["key"] = licenseKey;
            }

            await SendAsync(payload);
            return IsSuccess;
        }

        // ============================================
        // ✅ QUICK LICENSE LOGIN (Simple one-call)
        // ============================================
        public async Task<bool> QuickLicenseLogin(string key)
        {
            // First try license-login
            if (await LicenseLogin(key))
            {
                return true;
            }

            // If fails, try validate + login
            if (await License(key))
            {
                string username = "user_" + key.Replace("-", "").Substring(0, Math.Min(8, key.Replace("-", "").Length));
                return await Login(username, key);
            }

            return false;
        }

        // ============================================
        // CORE SEND METHOD
        // ============================================
        private async Task SendAsync(Dictionary<string, object> payload)
        {
            try
            {
                var json = JsonConvert.SerializeObject(payload);
                var body = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await Http.PostAsync(_apiUrl, body);
                var result = await response.Content.ReadAsStringAsync();

                var api = JsonConvert.DeserializeObject<ApiResponse>(result);

                IsSuccess = api.success;
                Message = api.message;
                User = api.user;
                Token = api.token;
            }
            catch (Exception ex)
            {
                IsSuccess = false;
                Message = ex.Message;
                User = null;
                Token = null;
            }
        }

        // ============================================
        // GET HWID
        // ============================================
        public static string GetHwid()
        {
            try
            {
                // Try CPU ID
                using (var searcher = new ManagementObjectSearcher("SELECT ProcessorId FROM Win32_Processor"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        string cpuId = obj["ProcessorId"]?.ToString();
                        if (!string.IsNullOrEmpty(cpuId) && cpuId != "0000000000000000")
                        {
                            return cpuId;
                        }
                    }
                }

                // Fallback: Volume Serial
                using (var searcher = new ManagementObjectSearcher("SELECT VolumeSerialNumber FROM Win32_LogicalDisk WHERE DeviceID='C:'"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        return obj["VolumeSerialNumber"]?.ToString() ?? "UNKNOWN";
                    }
                }
            }
            catch { }

            // Ultimate fallback
            return Environment.MachineName + "_" + Environment.UserName;
        }

        // ============================================
        // API RESPONSE CLASS
        // ============================================
        private class ApiResponse
        {
            public bool success { get; set; }
            public string message { get; set; }
            public UserInfo user { get; set; }
            public string token { get; set; }
        }
    }

    // ============================================
    // USER INFO CLASS
    // ============================================
    public class UserInfo
    {
        public string username { get; set; }
        public string expiry { get; set; }
        public string hwid { get; set; }
        public string plan { get; set; }
        public string role { get; set; }

        public bool IsExpired()
        {
            if (string.IsNullOrEmpty(expiry) || expiry == "never" || expiry == "Never") return false;
            if (DateTime.TryParse(expiry, out DateTime expiryDate))
            {
                return expiryDate < DateTime.Now;
            }
            return false;
        }

        public int DaysRemaining()
        {
            if (string.IsNullOrEmpty(expiry) || expiry == "never" || expiry == "Never") return 999;
            if (DateTime.TryParse(expiry, out DateTime expiryDate))
            {
                return (expiryDate - DateTime.Now).Days;
            }
            return 0;
        }
    }
}