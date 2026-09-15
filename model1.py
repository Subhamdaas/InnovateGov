# ==========================================================
# MODEL 1: UNSUPERVISED SEMANTIC STARTUP MATCHING ENGINE
# ==========================================================
#
# INPUT:
#   Government Problem Statement
#
# OUTPUT:
#   Top matching startups
#
# METHOD:
#   Sentence Transformer Embeddings
#   +
#   Cosine Similarity
#
# NO:
#   - TF-IDF
#   - Supervised training
#   - Labels
#   - Hard-coded government problems
#   - Hard-coded benchmark startups
#
# DATASETS:
#   1. Startups1.csv
#   2. Indian_startups_funding.csv
# ==========================================================


# ==========================================================
# 1. IMPORT LIBRARIES
# ==========================================================

import os
import re
import numpy as np
import pandas as pd

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# ==========================================================
# 2. FILE PATHS
# ==========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

FILE1 = os.path.join(
    BASE_DIR,
    "Startups1.csv"
)

FILE2 = os.path.join(
    BASE_DIR,
    "Indian_startups_funding.csv"
)


# ==========================================================
# 3. LOAD AND PREPARE DATA
# ==========================================================

def load_and_prepare_dataset(
    file1_path=FILE1,
    file2_path=FILE2
):

    # ------------------------------------------------------
    # DATASET 1
    # Startups1.csv
    # ------------------------------------------------------

    df1 = pd.read_csv(file1_path)

    p1 = df1[
        [
            "Company",
            "Industries",
            "Description",
            "City"
        ]
    ].copy()

    p1.rename(
        columns={
            "Company": "name",
            "Industries": "industries",
            "Description": "description",
            "City": "city"
        },
        inplace=True
    )


    # ------------------------------------------------------
    # DATASET 2
    # Indian_startups_funding.csv
    # ------------------------------------------------------

    df2 = pd.read_csv(file2_path)


    # Startup names already present
    existing_names = set(
        p1["name"]
        .fillna("")
        .astype(str)
        .str.lower()
        .str.strip()
    )


    # Remove duplicate startups
    df2_unique = df2[
        ~df2["startup"]
        .fillna("")
        .astype(str)
        .str.lower()
        .str.strip()
        .isin(existing_names)
    ].copy()


    # ------------------------------------------------------
    # GROUP DATASET 2
    # ------------------------------------------------------

    df2_grouped = (
        df2_unique
        .groupby("startup")
        .agg(
            {
                "vertical": lambda x: ", ".join(
                    x.dropna()
                    .astype(str)
                    .unique()[:5]
                ),
                "city": "first"
            }
        )
        .reset_index()
    )


    df2_grouped.rename(
        columns={
            "startup": "name",
            "vertical": "industries"
        },
        inplace=True
    )


    # Create a description because Dataset 2
    # does not have a detailed startup description
    df2_grouped["description"] = (
        "Technology, products, solutions and "
        "services related to "
        + df2_grouped["industries"].fillna("")
    )


    # ------------------------------------------------------
    # MERGE BOTH DATASETS
    # ------------------------------------------------------

    dataset = pd.concat(
        [
            p1,
            df2_grouped[
                [
                    "name",
                    "industries",
                    "description",
                    "city"
                ]
            ]
        ],
        ignore_index=True
    )


    # ------------------------------------------------------
    # CLEAN DATA
    # ------------------------------------------------------

    for column in [
        "name",
        "industries",
        "description",
        "city"
    ]:

        dataset[column] = (
            dataset[column]
            .fillna("")
            .astype(str)
            .str.strip()
        )


    # ------------------------------------------------------
    # REMOVE EMPTY STARTUP NAMES
    # ------------------------------------------------------

    dataset = dataset[
        dataset["name"] != ""
    ].copy()


    # ------------------------------------------------------
    # REMOVE DUPLICATE STARTUPS
    # ------------------------------------------------------

    dataset["name_clean"] = (
        dataset["name"]
        .str.lower()
        .str.strip()
    )

    dataset = dataset.drop_duplicates(
        subset="name_clean"
    ).copy()


    # ------------------------------------------------------
    # CREATE STARTUP PROFILE
    # ------------------------------------------------------
    #
    # We give the embedding model meaningful context.
    #
    # Example:
    #
    # Startup: XYZ
    # Industries: Artificial Intelligence, Healthcare
    # Description: AI healthcare platform
    #
    # ------------------------------------------------------

    dataset["profile_text"] = (
        "Startup name: "
        + dataset["name"]
        + ". Industries: "
        + dataset["industries"]
        + ". Description: "
        + dataset["description"]
    )


    # Reset index after filtering
    dataset.reset_index(
        drop=True,
        inplace=True
    )


    return dataset


# ==========================================================
# 4. TEXT CLEANING
# ==========================================================

def clean_text(text):

    text = str(text)

    # Lowercase
    text = text.lower()

    # Remove special characters
    text = re.sub(
        r"[^a-zA-Z0-9\s]",
        " ",
        text
    )

    # Remove extra spaces
    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()

    return text


# ==========================================================
# 5. LOAD EMBEDDING MODEL
# ==========================================================

def load_embedding_model():

    print("\nLoading embedding model...")

    model = SentenceTransformer(
        "all-MiniLM-L6-v2"
    )

    print("Embedding model loaded.")

    return model


# ==========================================================
# 6. CREATE STARTUP EMBEDDINGS
# ==========================================================

def create_startup_embeddings(
    dataset,
    model
):

    print("\nCreating startup embeddings...")

    profiles = (
        dataset["profile_text"]
        .apply(clean_text)
        .tolist()
    )


    embeddings = model.encode(
        profiles,
        show_progress_bar=True,
        normalize_embeddings=True
    )


    print(
        f"Created embeddings for "
        f"{len(profiles)} startups."
    )


    return embeddings


# ==========================================================
# 7. MATCH GOVERNMENT PROBLEM
# ==========================================================

def match_startups(
    government_problem,
    dataset,
    model,
    startup_embeddings,
    top_k=5
):

    # ------------------------------------------------------
    # CLEAN GOVERNMENT PROBLEM
    # ------------------------------------------------------

    problem = clean_text(
        government_problem
    )


    # ------------------------------------------------------
    # CREATE PROBLEM EMBEDDING
    # ------------------------------------------------------

    problem_embedding = model.encode(
        [problem],
        normalize_embeddings=True
    )


    # ------------------------------------------------------
    # CALCULATE COSINE SIMILARITY
    # ------------------------------------------------------

    similarity_scores = cosine_similarity(
        problem_embedding,
        startup_embeddings
    )[0]


    # Add similarity scores
    results = dataset.copy()

    results["similarity"] = similarity_scores


    # ------------------------------------------------------
    # SCORE FOR DISPLAY
    # ------------------------------------------------------
    #
    # This is a similarity score converted to 0-100.
    # It is NOT a probability.
    #
    # ------------------------------------------------------

    results["match_score"] = np.round(
        results["similarity"] * 100,
        2
    )


    # ------------------------------------------------------
    # SORT BY SIMILARITY
    # ------------------------------------------------------

    top_matches = (
        results
        .sort_values(
            by="similarity",
            ascending=False
        )
        .head(top_k)
        .copy()
    )


    # ======================================================
    # DISPLAY RESULTS
    # ======================================================

    print("\n")
    print("=" * 75)
    print(
        "        GOVERNMENT → STARTUP SEMANTIC MATCHING"
    )
    print("=" * 75)


    print("\nGovernment Problem:")
    print(f"> {government_problem}")


    print("\n" + "-" * 75)
    print("TOP MATCHING STARTUPS")
    print("-" * 75)


    for rank, (_, row) in enumerate(
        top_matches.iterrows(),
        start=1
    ):

        print(
            f"\n{rank}. {row['name']}"
        )

        print(
            f"   Match Score : "
            f"{row['match_score']}/100"
        )

        print(
            f"   Industry    : "
            f"{row['industries']}"
        )

        print(
            f"   City        : "
            f"{row['city']}"
        )

        print(
            f"   Description : "
            f"{row['description']}"
        )


    print("\n" + "=" * 75)


    # ------------------------------------------------------
    # RETURN RESULTS
    # ------------------------------------------------------

    return top_matches[
        [
            "name",
            "industries",
            "description",
            "city",
            "similarity",
            "match_score"
        ]
    ]


# ==========================================================
# 8. MAIN PROGRAM
# ==========================================================

if __name__ == "__main__":

    # ------------------------------------------------------
    # LOAD DATA
    # ------------------------------------------------------

    print("=" * 75)
    print("       GOVERNMENT → STARTUP MATCHING SYSTEM")
    print("=" * 75)


    print("\nLoading startup datasets...")

    data = load_and_prepare_dataset()


    print(
        f"Total startups available: "
        f"{len(data)}"
    )


    # ------------------------------------------------------
    # LOAD EMBEDDING MODEL
    # ------------------------------------------------------

    model = load_embedding_model()


    # ------------------------------------------------------
    # CREATE STARTUP EMBEDDINGS
    # ------------------------------------------------------

    startup_embeddings = (
        create_startup_embeddings(
            data,
            model
        )
    )


    # ------------------------------------------------------
    # GOVERNMENT INPUT
    # ------------------------------------------------------

    print("\n" + "-" * 75)

    government_problem = input(
        "Enter Government Problem:\n> "
    )


    # Check empty input
    if not government_problem.strip():

        print(
            "\nError: Government problem "
            "cannot be empty."
        )

    else:

        # --------------------------------------------------
        # RUN MATCHING
        # --------------------------------------------------

        results = match_startups(
            government_problem=government_problem,
            dataset=data,
            model=model,
            startup_embeddings=startup_embeddings,
            top_k=5
        )

