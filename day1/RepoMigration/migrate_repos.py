import requests
import pandas as pd
import csv
import logging
import colorlog

# Configure colored logging
handler = colorlog.StreamHandler()
handler.setFormatter(colorlog.ColoredFormatter(
    '%(log_color)s%(asctime)s - %(levelname)s - %(message)s',
    log_colors={
        'DEBUG': 'cyan',
        'INFO': 'green',
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'bold_red',
    }
))

logger = colorlog.getLogger()
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)

# Constants
GITHUB_API_URL = "https://api.github.com"
GITHUB_TOKEN = "token"  
TARGET_ORG = "shankarmounesh"    
USERNAME = "smounesh"

# Function to transfer a repository
def transfer_repository(repo_name):
    logger.info(f"Starting transfer for repository: {repo_name}")
    
    # Transfer the repository to the target organization
    url = f"{GITHUB_API_URL}/repos/{USERNAME}/{repo_name}/transfer"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    data = {
        "new_owner": TARGET_ORG
    }
    
    logger.debug(f"POST URL: {url}")
    logger.debug(f"Headers: {headers}")
    logger.debug(f"Data: {data}")
    
    response = requests.post(url, json=data, headers=headers)
    
    logger.debug(f"Response Status Code: {response.status_code}")
    logger.debug(f"Response Content: {response.content}")

    if response.status_code == 202:
        # Repository transfer initiated successfully
        logger.info(f"Transfer successful for repository: {repo_name}")
        return "Success", response.json()["html_url"]
    else:
        # Handle errors
        error_message = response.json().get("message", "Unknown error")
        logger.error(f"Transfer failed for repository: {repo_name} - Error: {error_message}")
        return "Failed", error_message

# Read the input CSV file
input_file = "input_repos.csv"
output_file = "output_repos.csv"

# Initialize a list to hold the results
results = []

logger.info(f"Reading input file: {input_file}")

# Read the CSV file
with open(input_file, mode='r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        repo_name = row["repo_name"]
        logger.info(f"Processing repository: {repo_name}")

        # Transfer the repository
        status, repo_url = transfer_repository(repo_name)
        
        # Append the result
        results.append({
            "repo_name": repo_name,
            "status": status
        })

logger.info(f"Writing results to output file: {output_file}")

# Write the results to the output CSV file
output_df = pd.DataFrame(results)
output_df.to_csv(output_file, index=False)

logger.info(f"Migration completed. Results saved to {output_file}.")