using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CombatCatalyst.Server.Models;
using Microsoft.Extensions.Logging;

namespace CombatCatalyst.Server.Services
{
    public class Open5eService : IOpen5eService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<Open5eService> _logger;

        public Open5eService(HttpClient httpClient, ILogger<Open5eService> logger)
        {
            _httpClient = httpClient;
            // No BaseAddress - We use absolute URLs to stop C# from mangling the request
            _httpClient.BaseAddress = null;
            // Identifying our app so the API firewall doesn't block us
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "CombatCatalyst-CapstoneProject");
            _logger = logger;
        }

        public async Task<Monster?> GetMonsterAsync(string monsterSlug)
        {
            try
            {
                // Strip out weird characters in case you typed "srd_goblin"
                string searchQuery = monsterSlug.Trim().ToLower().Replace("-", " ").Replace("_", " ");

                // We use the absolute V1 Search Endpoint
                string requestUrl = $"https://api.open5e.com/v1/monsters/?search={searchQuery}";

                _logger.LogInformation("================================================");
                _logger.LogInformation("QUERYING OPEN5E SEARCH ENGINE: {Url}", requestUrl);

                HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("API HTTP ERROR: {StatusCode}", (int)response.StatusCode);
                    return null;
                }

                // We got past the 404! Now read the data.
                string jsonResponse = await response.Content.ReadAsStringAsync();

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var searchResult = JsonSerializer.Deserialize<Open5eSearchResponse>(jsonResponse, options);

                // NEW LOGIC: Look through the results and try to find an EXACT match to the name first
                var foundMonster = searchResult?.Results?.FirstOrDefault(m =>
                    m.Name.Equals(searchQuery, StringComparison.OrdinalIgnoreCase));

                // If an exact name match isn't found, fall back to just grabbing the first search result
                if (foundMonster == null)
                {
                    foundMonster = searchResult?.Results?.FirstOrDefault();
                }

                if (foundMonster != null)
                {
                    _logger.LogInformation("SUCCESS! Found: {Name} (Database Slug: {Slug})", foundMonster.Name, foundMonster.Slug);
                }

                return foundMonster;
            }
            catch (JsonException jEx)
            {
                _logger.LogError("JSON PARSE ERROR: {Message}", jEx.Message);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError("CRITICAL ERROR: {Message}", ex.Message);
                return null;
            }
        }
    }

    // The wrapper class required to "catch" the array of search results
    public class Open5eSearchResponse
    {
        [JsonPropertyName("results")]
        public List<Monster> Results { get; set; } = new();
    }
}