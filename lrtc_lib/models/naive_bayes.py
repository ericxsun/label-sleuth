import logging
import os
import pickle

import numpy as np

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import GaussianNB, MultinomialNB

from lrtc_lib.models.core.models_background_jobs_manager import ModelsBackgroundJobsManager
from lrtc_lib.definitions import ROOT_DIR
from lrtc_lib.models.core.languages import Languages
from lrtc_lib.models.core.model_api import ModelAPI
from lrtc_lib.models.core.prediction import Prediction
from lrtc_lib.models.core.tools import RepresentationType, get_glove_representation

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s')


class NaiveBayes(ModelAPI):
    def __init__(self, representation_type: RepresentationType,
                 models_background_jobs_manager: ModelsBackgroundJobsManager,
                 max_datapoints=10000, model_dir=os.path.join(ROOT_DIR, "output", "models", "nb")):
        super().__init__(models_background_jobs_manager)
        os.makedirs(model_dir, exist_ok=True)
        self.model_dir = model_dir
        self.features_num = 0
        self.max_datapoints = max_datapoints
        self.infer_batch_size = max_datapoints
        self.representation_type = representation_type

    def _train(self, model_id, train_data, train_params):
        model = MultinomialNB() if self.representation_type == RepresentationType.BOW else GaussianNB()
        language = self.get_language(model_id)
        texts = [x['text'] for x in train_data]
        texts = texts[:self.max_datapoints]
        train_data_features, vectorizer = self.input_to_features(texts, language=language)
        labels = [x['label'] for x in train_data]
        labels = labels[:self.max_datapoints]
        model.fit(train_data_features, labels)

        with open(self.vectorizer_file_by_id(model_id), "wb") as fl:
            pickle.dump(vectorizer, fl)
        with open(self.model_file_by_id(model_id), "wb") as fl:
            pickle.dump(model, fl)

    def _infer(self, model_id, items_to_infer):
        with open(self.vectorizer_file_by_id(model_id), "rb") as fl:
            vectorizer = pickle.load(fl)
        with open(self.model_file_by_id(model_id), "rb") as fl:
            model = pickle.load(fl)
        language = self.get_language(model_id)

        items_to_infer = [x['text'] for x in items_to_infer]
        last_batch = 0
        predictions = []
        while last_batch < len(items_to_infer):
            batch = items_to_infer[last_batch:last_batch + self.infer_batch_size]
            last_batch += self.infer_batch_size
            batch, _ = self.input_to_features(batch, language=language, vectorizer=vectorizer)
            predictions.append(model.predict_proba(batch))
        predictions = np.concatenate(predictions, axis=0)

        labels = [bool(np.argmax(prediction)) for prediction in predictions]
        # The True label is in the second position as sorted([True, False]) is [False, True]
        scores = [prediction[1] for prediction in predictions]
        return [Prediction(label=label, score=score) for label, score in zip(labels, scores)]

    def input_to_features(self, texts, language=Languages.ENGLISH, vectorizer=None):
        if self.representation_type == RepresentationType.BOW:
            if vectorizer is None:
                vectorizer = CountVectorizer(analyzer="word", tokenizer=None, preprocessor=None, stop_words=None,
                                             lowercase=True, max_features=1000)
                train_data_features = vectorizer.fit_transform(texts)
                return train_data_features, vectorizer
            else:
                return vectorizer.transform(texts), None
        elif self.representation_type == RepresentationType.GLOVE:
            return get_glove_representation(texts, language=language), None

    def model_file_by_id(self, model_id):
        return os.path.join(self.get_model_dir_by_id(model_id), "model")

    def vectorizer_file_by_id(self, model_id):
        return os.path.join(self.get_model_dir_by_id(model_id), "vectorizer")

    def get_models_dir(self):
        return self.model_dir
