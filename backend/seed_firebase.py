import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def initialize_firebase():
    """Initialize Firebase with credentials from .env"""
    firebase_credentials_json = os.getenv("FIREBASE_CREDENTIALS")
    if not firebase_credentials_json:
        raise ValueError("FIREBASE_CREDENTIALS not found in environment variables. Please check your .env file.")
    
    firebase_credentials = json.loads(firebase_credentials_json)
    cred = credentials.Certificate(firebase_credentials)
    
    try:
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized successfully")
        return firestore.client()
    except Exception as e:
        print(f"❌ Failed to initialize Firebase: {str(e)}")
        return None

def load_json_data(filepath: str) -> list:
    """Load data from a JSON file"""
    try:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Handle both direct array and object with array property
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict) and 'mentors' in data:
                    return data['mentors']
                else:
                    print(f"⚠️ Unexpected data format in {filepath}")
                    return []
        else:
            print(f"⚠️ File not found: {filepath}")
            return []
    except Exception as e:
        print(f"❌ Error loading {filepath}: {str(e)}")
        return []

def seed_careers(db, careers_data: list):
    """Add careers data to Firestore"""
    try:
        if not careers_data:
            print("⚠️ No careers data to seed")
            return
        
        careers_ref = db.collection('careers')
        
        # Clear existing data (optional)
        docs = careers_ref.stream()
        deleted_count = 0
        for doc in docs:
            doc.reference.delete()
            deleted_count += 1
        if deleted_count > 0:
            print(f"🗑️ Cleared {deleted_count} existing career documents")
        
        # Add new data
        added_count = 0
        for career in careers_data:
            career_id = career.get("career_id")
            if career_id:
                careers_ref.document(career_id).set(career)
                added_count += 1
                print(f"✅ Added career: {career.get('title', 'Unknown')}")
        
        print(f"🎉 Successfully seeded {added_count} careers")
        
    except Exception as e:
        print(f"❌ Error seeding careers: {str(e)}")

def seed_mentors(db, mentors_data: list):
    """Add mentors data to Firestore"""
    try:
        if not mentors_data:
            print("⚠️ No mentors data to seed")
            return
        
        mentors_ref = db.collection('mentors')
        
        # Clear existing data (optional)
        docs = mentors_ref.stream()
        deleted_count = 0
        for doc in docs:
            doc.reference.delete()
            deleted_count += 1
        if deleted_count > 0:
            print(f"🗑️ Cleared {deleted_count} existing mentor documents")
        
        # Add new data
        added_count = 0
        for mentor in mentors_data:
            mentor_id = mentor.get("id")
            if mentor_id:
                mentors_ref.document(mentor_id).set(mentor)
                added_count += 1
                print(f"✅ Added mentor: {mentor.get('name', 'Unknown')}")
        
        print(f"🎉 Successfully seeded {added_count} mentors")
        
    except Exception as e:
        print(f"❌ Error seeding mentors: {str(e)}")

def seed_survey_questions(db):
    """Add initial survey questions to Firestore"""
    try:
        # Define the initial survey questions (reduced to 5)
        survey_questions = [
            {
                "id": "interests",
                "question": "What subjects or topics interest you the most?",
                "type": "radio",
                "options": [
                    "Science and Technology",
                    "Arts and Creativity", 
                    "Business and Entrepreneurship",
                    "Healthcare and Medicine",
                    "Sports and Physical Activities"
                ],
                "required": True,
                "order": 1
            },
            {
                "id": "favorite_subjects",
                "question": "Which school subjects do you enjoy the most?",
                "type": "checkbox",
                "options": [
                    "Mathematics",
                    "Physics/Chemistry/Biology",
                    "English/Literature",
                    "History/Social Studies",
                    "Computer Science/Programming"
                ],
                "required": True,
                "order": 2
            },
            {
                "id": "activities",
                "question": "What activities do you enjoy doing in your free time?",
                "type": "checkbox",
                "options": [
                    "Reading books or articles",
                    "Playing video games or coding",
                    "Drawing, painting, or creating art",
                    "Playing sports or outdoor activities",
                    "Helping others or volunteering"
                ],
                "required": True,
                "order": 3
            },
            {
                "id": "strengths",
                "question": "What are your natural strengths or talents?",
                "type": "checkbox",
                "options": [
                    "Solving complex problems",
                    "Communicating ideas clearly",
                    "Working with numbers and data",
                    "Being creative and innovative",
                    "Leading group activities"
                ],
                "required": True,
                "order": 4
            },
            {
                "id": "future_goals",
                "question": "What kind of impact do you want to make in the world?",
                "type": "radio",
                "options": [
                    "Advancing technology and innovation",
                    "Creating art and culture",
                    "Building successful businesses",
                    "Improving healthcare and wellness",
                    "Protecting the environment"
                ],
                "required": True,
                "order": 5
            }
        ]
        
        questions_ref = db.collection('survey_questions')
        
        # Clear existing data (optional)
        docs = questions_ref.stream()
        for doc in docs:
            doc.reference.delete()
        
        # Add new data
        for question in survey_questions:
            question_id = question.get("id")
            if question_id:
                questions_ref.document(question_id).set(question)
                print(f"✅ Added survey question: {question.get('question', 'Unknown')}")
        
        print(f"🎉 Successfully seeded {len(survey_questions)} survey questions")
        
    except Exception as e:
        print(f"❌ Error seeding survey questions: {str(e)}")

def main():
    """Main function to run the seeding process"""
    print("🚀 Starting Firebase seeding process...")
    
    # Initialize Firebase
    db = initialize_firebase()
    if not db:
        print("❌ Cannot proceed without Firebase connection")
        return
    
    # Define data file paths
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    careers_file = os.path.join(data_dir, 'mock_career_data.json')
    mentors_file = os.path.join(data_dir, 'mentors.json')
    
    # Load data from JSON files
    print("\n📂 Loading data from JSON files...")
    careers_data = load_json_data(careers_file)
    mentors_data = load_json_data(mentors_file)
    
    print(f"📊 Loaded {len(careers_data)} careers from {careers_file}")
    print(f"👥 Loaded {len(mentors_data)} mentors from {mentors_file}")
    
    # Seed data
    print("\n📊 Seeding careers...")
    seed_careers(db, careers_data)
    
    print("\n👥 Seeding mentors...")
    seed_mentors(db, mentors_data)
    
    print("\n📝 Seeding survey questions...")
    seed_survey_questions(db)
    
    print("\n🎯 Seeding complete!")
    print("💡 You can now run your app and it should use the data from Firebase instead of mock data.")
    print(f"📈 Total records seeded: {len(careers_data)} careers + {len(mentors_data)} mentors + 5 survey questions")


def main():
    """Main function to run the seeding process"""
    print("🚀 Starting Firebase seeding process...")
    
    # Initialize Firebase
    db = initialize_firebase()
    if not db:
        print("❌ Cannot proceed without Firebase connection")
        return
    
    # Define data file paths

    
    print("\n📝 Seeding survey questions...")
    seed_survey_questions(db)
    
    print("\n🎯 Seeding complete!")
    print("💡 You can now run your app and it should use the data from Firebase instead of mock data.")

if __name__ == "__main__":
    main()
