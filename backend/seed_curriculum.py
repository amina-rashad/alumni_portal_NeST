from app import create_app, get_db

app = create_app()
with app.app_context():
    db = get_db()
    
    curriculums = {
        'Corporate Communication & Soft Skills': [
            {'title': 'Professional Email Etiquette & Business Writing', 'duration': '1h 15m', 'type': 'Theory'},
            {'title': 'Cross-Functional Collaboration & Stakeholder Alignment', 'duration': '2h 00m', 'type': 'Standards'},
            {'title': 'Executive Presentation Design & Storytelling', 'duration': '1h 45m', 'type': 'Practical'},
            {'title': 'Conflict Resolution & Empathetic Leadership', 'duration': '2h 30m', 'type': 'Advanced'}
        ],
        'Strategic Enterprise Leadership': [
            {'title': 'Strategic Decision Frameworks & OKRs', 'duration': '1h 30m', 'type': 'Strategy'},
            {'title': 'High-Performance Agile Team Leadership', 'duration': '2h 15m', 'type': 'Practice'},
            {'title': 'Executive Stakeholder Governance & Risk Control', 'duration': '2h 45m', 'type': 'Governance'},
            {'title': 'Change Management & Organizational Scaling', 'duration': '3h 00m', 'type': 'Executive'}
        ],
        'Python for Data Science & AI': [
            {'title': 'NumPy, Pandas & Vectorized Data Manipulation', 'duration': '2h 30m', 'type': 'Foundations'},
            {'title': 'Statistical Analysis & Exploratory Data Science', 'duration': '3h 00m', 'type': 'Analytics'},
            {'title': 'Scikit-Learn Supervised & Unsupervised Modeling', 'duration': '3h 45m', 'type': 'Machine Learning'},
            {'title': 'Neural Networks & Applied Deep Learning Pipelines', 'duration': '4h 15m', 'type': 'Deep Learning'}
        ],
        'Advanced Microsoft Excel & Power BI': [
            {'title': 'Advanced Lookup Formulas & Dynamic Arrays', 'duration': '2h 00m', 'type': 'Formulas'},
            {'title': 'Power Query ETL & Data Cleansing Pipelines', 'duration': '2h 45m', 'type': 'ETL'},
            {'title': 'DAX Formulas & Relational Data Modeling', 'duration': '3h 15m', 'type': 'Modeling'},
            {'title': 'Interactive Executive Dashboard Design', 'duration': '3h 30m', 'type': 'Visuals'}
        ],
        'Full-Stack React & Node.js Architecture': [
            {'title': 'Component Hierarchy & State Machine Architecture', 'duration': '2h 30m', 'type': 'Frontend'},
            {'title': 'Express RESTful Services & MongoDB Aggregations', 'duration': '3h 15m', 'type': 'Backend'},
            {'title': 'JWT Security & Role-Based Access Control', 'duration': '2h 45m', 'type': 'Security'},
            {'title': 'Production Deployment & Cloud CI/CD Pipelines', 'duration': '3h 30m', 'type': 'DevOps'}
        ]
    }
    
    outcomes = {
        'Corporate Communication & Soft Skills': ['Master executive communication', 'Write compelling client proposals', 'Lead collaborative discussions'],
        'Strategic Enterprise Leadership': ['Formulate enterprise strategic OKRs', 'Navigate complex organizational dynamics', 'Govern organizational risk'],
        'Python for Data Science & AI': ['Build end-to-end predictive pipelines', 'Analyze real-world business datasets', 'Deploy production ML models'],
        'Advanced Microsoft Excel & Power BI': ['Automate multi-source data transformations', 'Write complex DAX analytical measures', 'Publish live Power BI dashboards'],
        'Full-Stack React & Node.js Architecture': ['Design robust full-stack enterprise systems', 'Implement secure role authentication', 'Deploy scalable cloud applications']
    }
    
    for title, curr in curriculums.items():
        res = db['courses'].update_many(
            {'title': title},
            {'$set': {'curriculum': curr, 'outcomes': outcomes.get(title, [])}}
        )
        print(f'Updated {title}: {res.modified_count} matched')
print('Finished updating course curriculums.')
