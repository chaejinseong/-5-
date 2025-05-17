import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
import joblib

df = pd.read_csv('data/sample_data.csv')

categories = ['교통', '식비', '술/유흥', '여행', '의료', '간식', '쇼핑', '주거']


def make_supervised(df, n_months=3):
    X, Y = [], []
    for user in df['user'].unique():
        user_df = df[df['user'] == user].sort_values('month')
        for i in range(len(user_df) - n_months):
            x_window = user_df.iloc[i:i+n_months][categories].values.flatten()
            y_target = user_df.iloc[i+n_months][categories].values
            X.append(x_window)
            Y.append(y_target)
    return X, Y

X, Y = make_supervised(df)

base_model = RandomForestRegressor(n_estimators=100, random_state=42)
model = MultiOutputRegressor(base_model)
model.fit(X, Y)

joblib.dump(model, 'model.pkl')
